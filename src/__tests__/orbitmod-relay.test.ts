import { describe, it, expect } from "vitest";
import {
  validateNeutralTone,
  calculateNoteHelpfulness,
  detectOffPlatformSolicitation,
  NoteRatingType,
} from "../lib/relay/relay-engine";
import {
  createCommunityNote,
  rateCommunityNote,
  getCommunityNotes,
  sendChatMessage,
  createSafetyReport,
  getRelayMetrics,
} from "../lib/relay/relay-service";

describe("OrbitMod V5: Relay Community, Messaging & Safety Engine (Stage 3.4)", () => {
  describe("Neutral Moderation Tone Validation", () => {
    it("should reject defamatory or accusatory language", () => {
      const badNotes = [
        "This company is a scam!",
        "Watch out, the founder is a known fraudster.",
        "They are criminals trying to steal your code.",
        "Total con artist operation.",
      ];

      for (const text of badNotes) {
        const res = validateNeutralTone(text);
        expect(res.valid).toBe(false);
        expect(res.flaggedTerm).toBeDefined();
        expect(res.reason).toContain("Violates neutral tone guidelines");
      }
    });

    it("should accept objective, factual, evidence-backed statements", () => {
      const goodNotes = [
        "Unable to confirm state registration under this exact name in Delaware database.",
        "Domain was registered 12 days ago with privacy protection enabled.",
        "Contract specifies a 90-day unpaid trial period prior to formal evaluation.",
        "Job description matches public template from external repository.",
      ];

      for (const text of goodNotes) {
        const res = validateNeutralTone(text);
        expect(res.valid).toBe(true);
      }
    });
  });

  describe("Deterministic Community Notes Helpfulness Scoring", () => {
    it("should return PROPOSED when no ratings exist", () => {
      const res = calculateNoteHelpfulness([]);
      expect(res.status).toBe("PROPOSED");
      expect(res.helpfulnessScore).toBe(0);
    });

    it("should return NEEDS_MORE_RATINGS when total ratings < 3", () => {
      const ratings: Array<{ raterId: string; rating: NoteRatingType; ratedAt: string }> = [
        { raterId: "r1", rating: "HELPFUL", ratedAt: new Date().toISOString() },
        { raterId: "r2", rating: "HELPFUL", ratedAt: new Date().toISOString() },
      ];
      const res = calculateNoteHelpfulness(ratings);
      expect(res.status).toBe("NEEDS_MORE_RATINGS");
      expect(res.helpfulnessScore).toBe(1.0);
    });

    it("should calculate exact helpfulness score: (H + 0.5*S) / Total", () => {
      // 2 HELPFUL (2 pts), 1 SOMEWHAT (0.5 pt), 1 NOT (0 pt) = 2.5 / 4 = 0.625 => 0.63
      const ratings: Array<{ raterId: string; rating: NoteRatingType; ratedAt: string }> = [
        { raterId: "r1", rating: "HELPFUL", ratedAt: new Date().toISOString() },
        { raterId: "r2", rating: "HELPFUL", ratedAt: new Date().toISOString() },
        { raterId: "r3", rating: "SOMEWHAT_HELPFUL", ratedAt: new Date().toISOString() },
        { raterId: "r4", rating: "NOT_HELPFUL", ratedAt: new Date().toISOString() },
      ];
      const res = calculateNoteHelpfulness(ratings);
      expect(res.helpfulnessScore).toBe(0.63);
      expect(res.status).toBe("CURRENTLY_RATED_NOT_HELPFUL"); // < 0.65 threshold
    });

    it("should award CURRENTLY_RATED_HELPFUL when score >= 0.65 and ratings >= 3", () => {
      // 3 HELPFUL, 1 SOMEWHAT = 3.5 / 4 = 0.88
      const ratings: Array<{ raterId: string; rating: NoteRatingType; ratedAt: string }> = [
        { raterId: "r1", rating: "HELPFUL", ratedAt: new Date().toISOString() },
        { raterId: "r2", rating: "HELPFUL", ratedAt: new Date().toISOString() },
        { raterId: "r3", rating: "HELPFUL", ratedAt: new Date().toISOString() },
        { raterId: "r4", rating: "SOMEWHAT_HELPFUL", ratedAt: new Date().toISOString() },
      ];
      const res = calculateNoteHelpfulness(ratings);
      expect(res.status).toBe("CURRENTLY_RATED_HELPFUL");
      expect(res.helpfulnessScore).toBe(0.88);
    });
  });

  describe("Deterministic Off-Platform Solicitation & Safety Detection", () => {
    it("should detect Telegram redirect solicitations", () => {
      const res1 = detectOffPlatformSolicitation("Hey let's talk more on Telegram: @apex_recruiter");
      expect(res1.hasOffPlatformRisk).toBe(true);
      expect(res1.detectedPatterns).toContain("Telegram redirection handle or link");

      const res2 = detectOffPlatformSolicitation("Join our channel at t.me/fast_hire_crypto");
      expect(res2.hasOffPlatformRisk).toBe(true);
    });

    it("should detect WhatsApp redirect solicitations", () => {
      const res = detectOffPlatformSolicitation("Please message me on WhatsApp at +1-555-0143 to schedule interview.");
      expect(res.hasOffPlatformRisk).toBe(true);
      expect(res.detectedPatterns).toContain("WhatsApp off-platform redirection");
    });

    it("should detect upfront fee / crypto deposit solicitations", () => {
      const res = detectOffPlatformSolicitation("You are selected! Please wire usdt deposit to secure your work laptop.");
      expect(res.hasOffPlatformRisk).toBe(true);
      expect(res.detectedPatterns).toContain("Upfront payment or crypto deposit solicitation");
    });

    it("should allow safe platform-internal collaboration without false positives", () => {
      const res = detectOffPlatformSolicitation("I reviewed your PR on GitHub and the unit tests look solid. Let's merge!");
      expect(res.hasOffPlatformRisk).toBe(false);
      expect(res.detectedPatterns).toHaveLength(0);
      expect(res.warningMessage).toBeUndefined();
    });
  });

  describe("Relay Service End-to-End Workflows", () => {
    it("should create Community Note with neutral copy", async () => {
      const note = await createCommunityNote({
        targetEntityType: "ORGANIZATION",
        targetEntityId: "apex-innovations-demo",
        authorId: "user-maya",
        content: "Verified corporate identity in state portal. Domain SPF and DKIM records properly aligned.",
        evidenceLinks: ["https://apexinnovations.org/security"],
      });

      expect(note.id).toBeDefined();
      expect(note.status).toBe("PROPOSED");
    });

    it("should block duplicate note submission by same author on same entity", async () => {
      await expect(
        createCommunityNote({
          targetEntityType: "ORGANIZATION",
          targetEntityId: "apex-innovations-demo",
          authorId: "user-maya", // Same author as previous test
          content: "Another note attempt on same organization.",
        })
      ).rejects.toThrow(/already submitted/i);
    });

    it("should block authors from rating their own notes", async () => {
      const note = await createCommunityNote({
        targetEntityType: "OPPORTUNITY",
        targetEntityId: "demo-opp-fullstack-001",
        authorId: "user-liam",
        content: "Opportunity requires weekly sync on Monday mornings UTC. Stipend terms clearly documented in PDF.",
      });

      await expect(
        rateCommunityNote({
          noteId: note.id,
          raterId: "user-liam", // Same as author
          rating: "HELPFUL",
        })
      ).rejects.toThrow(/authors cannot rate their own/i);
    });

    it("should allow independent reviewers to rate note and reach HELPFUL consensus", async () => {
      const note = await createCommunityNote({
        targetEntityType: "OPPORTUNITY",
        targetEntityId: "demo-opp-frontend-002",
        authorId: "user-sarah",
        content: "Repository references Tailwind CSS v4 alpha. Candidate should ensure node 20 compatibility.",
      });

      // Rater 1
      await rateCommunityNote({ noteId: note.id, raterId: "user-rev-1", rating: "HELPFUL" });
      // Rater 2
      await rateCommunityNote({ noteId: note.id, raterId: "user-rev-2", rating: "HELPFUL" });
      // Rater 3
      const updated = await rateCommunityNote({ noteId: note.id, raterId: "user-rev-3", rating: "HELPFUL" });

      expect(updated.ratings.length).toBe(3);
      expect(updated.status).toBe("CURRENTLY_RATED_HELPFUL");
      expect(updated.helpfulnessScore).toBe(1.0);
    });

    it("should send chat message and attach off-platform safety warning", async () => {
      const msg = await sendChatMessage({
        channelId: "channel-pod-nexus",
        senderId: "user-cand-1",
        senderName: "Builder One",
        content: "Hey team, check out this doc, or message me on Telegram @builder_one if urgent.",
      });

      expect(msg.id).toBeDefined();
      expect(msg.safetyCheck.hasOffPlatformRisk).toBe(true);
      expect(msg.safetyCheck.warningMessage).toContain("Safety Notice");
    });

    it("should file and retrieve a structured moderation safety report", async () => {
      const rep = await createSafetyReport({
        reporterId: "user-alex",
        targetType: "ORGANIZATION",
        targetId: "hypergrowth-stealth-demo",
        category: "OFF_PLATFORM_SOLICITATION",
        explanation: "Recruiter requested communication via Telegram and asked for upfront deposit for equipment.",
      });

      expect(rep.id).toBeDefined();
      expect(rep.status).toBe("PENDING");
    });

    it("should return realistic real Relay metrics without fake numbers", async () => {
      const metrics = await getRelayMetrics();
      expect(metrics.totalNotes).toBeGreaterThanOrEqual(1);
      expect(metrics.activeChannelsCount).toBeGreaterThanOrEqual(1);
      expect(metrics.safetyInterventionsCount).toBeGreaterThanOrEqual(1);
    });
  });
});
