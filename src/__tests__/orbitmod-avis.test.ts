import { describe, it, expect } from "vitest";
import {
  normalizeHomoglyphs,
  calculateLevenshteinDistance,
  detectLookAlikeDomain,
  generateDnsChallenge,
  validateRecruiterDomain,
  transitionAvisState,
  filterValidAnomalies,
} from "@/lib/avis/verification-engine";
import {
  getVerificationRecord,
  createDnsChallenge,
  submitReviewerDecision,
  submitVerificationAppeal,
  getReviewQueue,
  getAvisMetrics,
} from "@/lib/avis/avis-service";
import { canReviewVerification } from "@/lib/auth/orbitmod-permissions";

describe("OrbitMod V5: Avis Trust & Verification Engine (Stage 3.1)", () => {
  // ─── 1. HOMOGLYPH & LOOK-ALIKE DETECTION ────────────────────────────────────
  describe("Look-Alike & Homoglyph Detection", () => {
    it("should normalize Cyrillic and leetspeak homoglyphs to ASCII", () => {
      // Cyrillic 'а' (U+0430) and 'о' (U+043E)
      const cyrillicSpoof = "аpex-innоvations";
      const normalized = normalizeHomoglyphs(cyrillicSpoof);
      expect(normalized).toBe("apex-innovations");

      // Leetspeak '0' -> 'o', '1' -> 'l'
      expect(normalizeHomoglyphs("g00gle")).toBe("google");
    });

    it("should compute exact Levenshtein edit distance", () => {
      expect(calculateLevenshteinDistance("orbit", "orbit")).toBe(0);
      expect(calculateLevenshteinDistance("orbit", "orbi")).toBe(1);
      expect(calculateLevenshteinDistance("microsoft", "microsofft")).toBe(1);
      expect(calculateLevenshteinDistance("apple", "orange")).toBe(5);
    });

    it("should detect look-alike domains within edit distance threshold", () => {
      const verifiedDomains = ["microsoft.com", "google.com", "apexinnovations.org"];

      // Typo-squatting
      const typoResult = detectLookAlikeDomain("microsofft.com", verifiedDomains);
      expect(typoResult.isSuspicious).toBe(true);
      expect(typoResult.distance).toBe(1);
      expect(typoResult.matchedOrgDomain).toBe("microsoft.com");

      // Homoglyph spoofing
      const homoResult = detectLookAlikeDomain("g00gle.com", verifiedDomains);
      expect(homoResult.isSuspicious).toBe(true);

      // Exact match is not an impostor
      const exactResult = detectLookAlikeDomain("google.com", verifiedDomains);
      expect(exactResult.isSuspicious).toBe(false);

      // Distinct domain is safe
      const distinctResult = detectLookAlikeDomain("unrelatedstartup.io", verifiedDomains);
      expect(distinctResult.isSuspicious).toBe(false);
    });
  });

  // ─── 2. DNS TXT CHALLENGE GENERATION ────────────────────────────────────────
  describe("DNS Challenge Token Generation", () => {
    it("should generate cryptographically random token with documented host record", () => {
      const challenge = generateDnsChallenge("raftlabs.io", 60);

      expect(challenge.token).toMatch(/^orbit-verification-[a-f0-9]{32}$/);
      expect(challenge.hostRecord).toBe("_orbit-challenge.raftlabs.io");
      expect(challenge.expectedTxtValue).toBe(challenge.token);
      expect(new Date(challenge.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });

  // ─── 3. RECRUITER DOMAIN AFFILIATION ────────────────────────────────────────
  describe("Recruiter Domain Matching Rules", () => {
    const verifiedOrgDomain = "apexinnovations.org";
    const approvedAliases = ["apex.io", "apextalent.com"];

    it("should accept emails directly matching verified root domain", () => {
      const res = validateRecruiterDomain("talent@apexinnovations.org", verifiedOrgDomain);
      expect(res.isAffiliated).toBe(true);
    });

    it("should accept emails matching approved domain aliases", () => {
      const res = validateRecruiterDomain("recruiter@apex.io", verifiedOrgDomain, approvedAliases);
      expect(res.isAffiliated).toBe(true);
    });

    it("should reject public webmail providers (gmail, yahoo, etc.)", () => {
      const res = validateRecruiterDomain("hr.apex@gmail.com", verifiedOrgDomain, approvedAliases);
      expect(res.isAffiliated).toBe(false);
      expect(res.reason).toContain("does not match verified organisation domain");
    });

    it("should reject subdomain spoofing attacks", () => {
      const res = validateRecruiterDomain("recruiter@apexinnovations.org.attacker.com", verifiedOrgDomain);
      expect(res.isAffiliated).toBe(false);
    });
  });

  // ─── 4. DETERMINISTIC STATE MACHINE TRANSITIONS ──────────────────────────────
  describe("Avis State Machine Legal Transitions", () => {
    it("RULE A: VERIFIED can ONLY be reached by DNS success or Human Approval", () => {
      // 1. DNS Challenge Success -> VERIFIED
      const dnsRes = transitionAvisState("LIMITED_EVIDENCE", { type: "DNS_CHALLENGE_SUCCESS" });
      expect(dnsRes.nextState).toBe("VERIFIED");

      // 2. Human Reviewer Approval -> VERIFIED
      const humanRes = transitionAvisState("NEEDS_REVIEW", {
        type: "HUMAN_APPROVAL",
        reviewerId: "admin_1",
        reason: "Valid registration certificates checked",
      });
      expect(humanRes.nextState).toBe("VERIFIED");
    });

    it("RULE B: Risk signals and anomalies only move state to NEEDS_REVIEW or SUSPICIOUS", () => {
      const anomalyRes = transitionAvisState("UNVERIFIED", {
        type: "ANOMALY_OR_SUSPICION_DETECTED",
        reason: "Discovered fee request in text",
      });
      expect(anomalyRes.nextState).toBe("SUSPICIOUS");

      // Anomaly on verified entity moves it back to NEEDS_REVIEW
      const verifiedAnomaly = transitionAvisState("VERIFIED", {
        type: "ANOMALY_OR_SUSPICION_DETECTED",
        reason: "Domain whois changed",
      });
      expect(verifiedAnomaly.nextState).toBe("NEEDS_REVIEW");
    });

    it("RULE C: Provider outage MUST drop to NEEDS_REVIEW, NEVER VERIFIED", () => {
      const outageRes = transitionAvisState("UNVERIFIED", {
        type: "PROVIDER_OUTAGE",
        providerName: "SafeBrowsingAPI",
      });
      expect(outageRes.nextState).toBe("NEEDS_REVIEW");
      expect(outageRes.reason).toContain("check unavailable");
    });

    it("RULE D: Evidence expiry or affiliation change resets state to NEEDS_REVIEW", () => {
      const expiryRes = transitionAvisState("VERIFIED", { type: "EVIDENCE_EXPIRED" });
      expect(expiryRes.nextState).toBe("NEEDS_REVIEW");

      const changeRes = transitionAvisState("VERIFIED", { type: "AFFILIATION_CHANGED" });
      expect(changeRes.nextState).toBe("NEEDS_REVIEW");
    });

    it("RULE E: Appeal transitions state to NEEDS_REVIEW for independent review", () => {
      const appealRes = transitionAvisState("SUSPICIOUS", {
        type: "APPEAL_SUBMITTED",
        appealId: "app_123",
      });
      expect(appealRes.nextState).toBe("NEEDS_REVIEW");
    });
  });

  // ─── 5. ADVISORY AI ANOMALY VALIDATION ──────────────────────────────────────
  describe("Advisory AI Anomaly Verification", () => {
    it("should drop any anomaly whose evidenceRef does not match a real evidence row", () => {
      const aiRaw = {
        summary: "Evaluated organization documents",
        anomalies: [
          { code: "VALID_ANOMALY", evidenceRef: "ev_real_01", message: "Tax ID mismatch" },
          { code: "HALLUCINATED_ANOMALY", evidenceRef: "ev_fake_99", message: "Invented violation" },
        ],
        disclaimer: "Raw AI draft",
      };

      const realEvidenceIds = ["ev_real_01", "ev_real_02"];
      const filtered = filterValidAnomalies(aiRaw, realEvidenceIds);

      expect(filtered.anomalies).toHaveLength(1);
      expect(filtered.anomalies[0].code).toBe("VALID_ANOMALY");
      expect(filtered.disclaimer).toContain("AI-assisted advisory evaluation");
    });
  });

  // ─── 6. AVIS SERVICE & REVIEW QUEUE WORKFLOWS ───────────────────────────────
  describe("Avis Service End-to-End Workflows", () => {
    it("should retrieve initial verification records", async () => {
      const record = await getVerificationRecord("ORGANIZATION", "apex-innovations-demo");
      expect(record).toBeDefined();
      expect(record?.state).toBe("VERIFIED");
      expect(record?.evidence.length).toBeGreaterThan(0);
    });

    it("should generate a DNS challenge via service", async () => {
      const challenge = await createDnsChallenge("test-org-1", "testorg.com");
      expect(challenge.token).toBeTruthy();
      expect(challenge.hostRecord).toBe("_orbit-challenge.testorg.com");
    });

    it("should submit a human reviewer decision and update state with audit", async () => {
      const res = await submitReviewerDecision({
        recordId: "hypergrowth-stealth-demo",
        reviewerId: "admin_user_99",
        decision: "VERIFY",
        reason: "Valid legal entity certificate manually confirmed via state register",
      });

      expect(res.success).toBe(true);
      expect(res.record.state).toBe("VERIFIED");
      expect(res.record.reviewerId).toBe("admin_user_99");
    });

    it("should submit an appeal and place item in review queue", async () => {
      const appeal = await submitVerificationAppeal({
        recordId: "hypergrowth-stealth-demo",
        requesterId: "founder_user_1",
        reason: "We updated our DNS TXT record and provide updated business license",
        evidenceUrls: ["https://example.com/license.pdf"],
      });

      expect(appeal.id).toBeTruthy();
      expect(appeal.status).toBe("PENDING");

      const queue = await getReviewQueue();
      expect(queue.some((q) => q.resourceId === "hypergrowth-stealth-demo")).toBe(true);
    });

    it("should return realistic, non-zero metrics without fake numbers", async () => {
      const metrics = await getAvisMetrics();
      expect(metrics.totalRecords).toBeGreaterThan(0);
      expect(metrics.medianReviewTimeHours).toBeGreaterThan(0);
    });
  });
});
