import { describe, it, expect } from "vitest";
import {
  normalizeSkill,
  calculateRubricScore,
  calculatePeerConsensus,
  computeArtifactFingerprint,
  verifyArtifactIntegrity,
  calculateContentSimilarity,
  RubricCriterion,
} from "../lib/quill/quill-engine";
import {
  searchSkillsTaxonomy,
  getAssessments,
  submitAssessmentSolution,
  evaluateSubmission,
  createVerifiableEvidence,
  getEvidenceArtifact,
  getQuillMetrics,
} from "../lib/quill/quill-service";

describe("OrbitMod V5: Quill Skills, Assessments & Evidence Engine (Stage 3.3)", () => {
  describe("ESCO Taxonomy Skill Normalization", () => {
    it("should match exact standard skill names", () => {
      const res = normalizeSkill("TypeScript");
      expect(res.normalized).toBe(true);
      expect(res.suggestedName).toBe("TypeScript");
      expect(res.skill?.id).toBe("skill_ts");
    });

    it("should resolve known aliases to canonical ESCO skill names", () => {
      expect(normalizeSkill("ts").suggestedName).toBe("TypeScript");
      expect(normalizeSkill("reactjs").suggestedName).toBe("React");
      expect(normalizeSkill("postgres").suggestedName).toBe("PostgreSQL");
      expect(normalizeSkill("gql").suggestedName).toBe("GraphQL");
      expect(normalizeSkill("appsec").suggestedName).toBe("Security Auditing");
    });

    it("should handle mixed case and whitespace robustly", () => {
      const res = normalizeSkill("   tAiLwInD css  ");
      expect(res.normalized).toBe(true);
      expect(res.suggestedName).toBe("Tailwind CSS");
    });

    it("should flag unrecognized custom skills as unnormalized", () => {
      const res = normalizeSkill("Quantum Blockchain Wizardry 9000");
      expect(res.normalized).toBe(false);
      expect(res.suggestedName).toBe("Quantum Blockchain Wizardry 9000");
    });
  });

  describe("Deterministic Rubric Evaluation", () => {
    const testRubric: RubricCriterion[] = [
      { id: "c1", name: "Architecture", description: "Design", weight: 0.50, maxScore: 5 },
      { id: "c2", name: "Security", description: "Auth & Threat", weight: 0.50, maxScore: 5 },
    ];

    it("should award 100% when all criteria receive maxScore", () => {
      const evals = [
        { criterionId: "c1", score: 5 },
        { criterionId: "c2", score: 5 },
      ];
      const res = calculateRubricScore(testRubric, evals, 70);
      expect(res.totalScore).toBe(100);
      expect(res.passed).toBe(true);
    });

    it("should award 0% when all criteria receive minimum score 1", () => {
      const evals = [
        { criterionId: "c1", score: 1 },
        { criterionId: "c2", score: 1 },
      ];
      const res = calculateRubricScore(testRubric, evals, 70);
      expect(res.totalScore).toBe(0);
      expect(res.passed).toBe(false);
    });

    it("should correctly compute weighted intermediate score", () => {
      // Scale is 1 to 5 (span 4):
      // c1: 3 => (3 - 1) / 4 = 0.50 => 50% * 0.50 weight = 25 pts
      // c2: 4 => (4 - 1) / 4 = 0.75 => 75% * 0.50 weight = 37.5 pts
      // Total = 62.5 => rounds to 63%
      const evals = [
        { criterionId: "c1", score: 3 },
        { criterionId: "c2", score: 4 },
      ];
      const res = calculateRubricScore(testRubric, evals, 70);
      expect(res.totalScore).toBe(63);
      expect(res.passed).toBe(false); // < 70
    });
  });

  describe("Peer Review Consensus & Outlier Detection", () => {
    it("should require at least 2 reviews for consensus", () => {
      const res = calculatePeerConsensus([{ reviewerId: "rev-1", score: 85 }]);
      expect(res.consensusReached).toBe(false);
      expect(res.reviewsCount).toBe(1);
    });

    it("should compute median score when reviews are aligned", () => {
      const reviews = [
        { reviewerId: "rev-1", score: 80 },
        { reviewerId: "rev-2", score: 84 },
        { reviewerId: "rev-3", score: 86 },
      ];
      const res = calculatePeerConsensus(reviews, 15);
      expect(res.consensusReached).toBe(true);
      expect(res.medianScore).toBe(84);
      expect(res.divergentReviewers).toHaveLength(0);
    });

    it("should flag divergent outlier reviewers (>15 pts from median)", () => {
      const reviews = [
        { reviewerId: "rev-fair-1", score: 82 },
        { reviewerId: "rev-fair-2", score: 84 },
        { reviewerId: "rev-biased", score: 40 }, // 44 pts below median
      ];
      const res = calculatePeerConsensus(reviews, 15);
      expect(res.consensusReached).toBe(false);
      expect(res.divergentReviewers).toContain("rev-biased");
    });
  });

  describe("Cryptographic SHA-256 Fingerprinting & Integrity", () => {
    it("should compute stable, deterministic SHA-256 hashes", () => {
      const content = "function hello() { return 'world'; }";
      const hash1 = computeArtifactFingerprint(content);
      const hash2 = computeArtifactFingerprint(content);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it("should detect single-character tampering", () => {
      const original = "function authenticate() { return verifyJwt(); }";
      const tampered = "function authenticate() { return bypassJwt(); }";
      const hash = computeArtifactFingerprint(original);

      expect(verifyArtifactIntegrity(original, hash)).toBe(true);
      expect(verifyArtifactIntegrity(tampered, hash)).toBe(false);
    });
  });

  describe("Deterministic Collision & Plagiarism Detection", () => {
    it("should detect near-verbatim copied code or text (>= 85% similarity)", () => {
      const textA = "export async function handlePayment(amount: number, token: string) { return stripe.charges.create({ amount, token }); }";
      const textB = "export async function handlePayment(amount: number, token: string) { return stripe.charges.create({ amount, token }); } // Copied";
      const sim = calculateContentSimilarity(textA, textB);
      expect(sim).toBeGreaterThanOrEqual(0.85);
    });

    it("should report low similarity for completely distinct solutions", () => {
      const textA = "import React from 'react'; export function Button() { return <button>Click</button>; }";
      const textB = "SELECT u.id, u.email FROM users u JOIN accounts a ON u.id = a.user_id WHERE a.balance > 1000;";
      const sim = calculateContentSimilarity(textA, textB);
      expect(sim).toBeLessThanOrEqual(0.10);
    });
  });

  describe("Quill Service End-to-End Workflows", () => {
    it("should retrieve available standardized assessments", async () => {
      const list = await getAssessments();
      expect(list.length).toBeGreaterThanOrEqual(2);
      expect(list[0].rubric.length).toBeGreaterThan(0);
    });

    it("should submit assessment solution and prevent duplicate collision", async () => {
      const sub = await submitAssessmentSolution({
        assessmentId: "quill-assess-syssec-001",
        candidateId: "cand-bob",
        candidateName: "Bob Builder",
        artifactContent: "class SecureAuthPipeline {\n  private hmacKey: string;\n  constructor(key: string) { this.hmacKey = key; }\n}",
      });

      expect(sub.id).toBeDefined();
      expect(sub.artifactSha256).toHaveLength(64);

      // Attempting to submit duplicate should be blocked by collision pre-check
      await expect(
        submitAssessmentSolution({
          assessmentId: "quill-assess-syssec-001",
          candidateId: "cand-eve",
          candidateName: "Eve Copycat",
          artifactContent: "class SecureAuthPipeline {\n  private hmacKey: string;\n  constructor(key: string) { this.hmacKey = key; }\n}",
        })
      ).rejects.toThrow(/collision alert/i);
    });

    it("should disallow self-review of assessment submissions", async () => {
      const sub = await submitAssessmentSolution({
        assessmentId: "quill-assess-syssec-001",
        candidateId: "cand-self",
        candidateName: "Self Reviewer",
        artifactContent: "export const uniqueCodeBlock12345 = () => { return Math.random(); };",
      });

      await expect(
        evaluateSubmission({
          submissionId: sub.id,
          reviewerId: "cand-self", // Same reviewer as candidate
          reviewerName: "Self Reviewer",
          scores: [{ criterionId: "crit_arch", score: 5 }],
        })
      ).rejects.toThrow(/cannot evaluate their own/i);
    });

    it("should evaluate submission and issue evidence artifact upon passing consensus", async () => {
      const sub = await submitAssessmentSolution({
        assessmentId: "quill-assess-syssec-001",
        candidateId: "cand-charlie",
        candidateName: "Charlie Brown",
        artifactContent: "export class ProductionVerifiedModule {\n  audit() { return true; }\n}",
      });

      // Review 1
      await evaluateSubmission({
        submissionId: sub.id,
        reviewerId: "rev-eval-1",
        reviewerName: "Evaluator One",
        scores: [
          { criterionId: "crit_arch", score: 5 },
          { criterionId: "crit_sec", score: 5 },
          { criterionId: "crit_perf", score: 4 },
          { criterionId: "crit_test", score: 4 },
        ],
      });

      // Review 2 reaches consensus
      const res = await evaluateSubmission({
        submissionId: sub.id,
        reviewerId: "rev-eval-2",
        reviewerName: "Evaluator Two",
        scores: [
          { criterionId: "crit_arch", score: 4 },
          { criterionId: "crit_sec", score: 5 },
          { criterionId: "crit_perf", score: 5 },
          { criterionId: "crit_test", score: 4 },
        ],
      });

      expect(res.consensusResult.consensusReached).toBe(true);
      expect(res.submission.status).toBe("PASSED");
      expect(res.generatedEvidence).toBeDefined();
      expect(res.generatedEvidence?.status).toBe("VERIFIED");
      expect(res.generatedEvidence?.artifactSha256).toHaveLength(64);
    });

    it("should create direct verifiable evidence and verify audit integrity", async () => {
      const artifact = await createVerifiableEvidence({
        authorId: "cand-david",
        title: "Database Sharding & Replication Spec",
        content: "POSTGRESQL WAL STREAMING AND LOGICAL REPLICATION PROTOCOL v1.0",
        linkedSkillIds: ["skill_pg", "skill_arch"],
      });

      const audit = await getEvidenceArtifact(artifact.id);
      expect(audit.artifact).toBeDefined();
      expect(audit.isValidIntegrity).toBe(true);
    });

    it("should return transparent real Quill metrics without fake numbers", async () => {
      const metrics = await getQuillMetrics();
      expect(metrics.totalAssessments).toBeGreaterThanOrEqual(2);
      expect(metrics.normalizedSkillsCount).toBeGreaterThan(10);
      expect(metrics.averageScore).toBeGreaterThan(0);
      expect(metrics.averageScore).toBeLessThanOrEqual(100);
    });
  });
});
