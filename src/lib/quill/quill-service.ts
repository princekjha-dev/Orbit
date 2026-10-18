/**
 * ORBITMOD V5 - QUILL SERVICE
 * Business logic layer for Skills, Assessments, Rubrics, and Verifiable Evidence Artifacts.
 */

import { prisma } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit/audit-logger";
import { createOrbitModNotification } from "@/lib/notifications/orbitmod-notifications";
import {
  ESCO_SKILLS_TAXONOMY,
  RubricCriterion,
  RubricEvaluationItem,
  RubricScoreResult,
  PeerReviewConsensusResult,
  VerifiableEvidenceArtifact,
  calculateRubricScore,
  calculatePeerConsensus,
  computeArtifactFingerprint,
  verifyArtifactIntegrity,
  calculateContentSimilarity,
  normalizeSkill,
} from "./quill-engine";

export interface QuillAssessment {
  id: string;
  title: string;
  category: string;
  description: string;
  linkedSkillIds: string[];
  rubric: RubricCriterion[];
  passingScore: number;
  submissionsCount: number;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  candidateId: string;
  candidateName: string;
  artifactContent: string;
  artifactSha256: string;
  reviews: Array<{
    reviewerId: string;
    reviewerName: string;
    scores: RubricEvaluationItem[];
    totalScore: number;
    submittedAt: string;
  }>;
  consensusScore?: number;
  status: "PENDING_REVIEW" | "PASSED" | "FAILED" | "SUSPECT_PLAGIARISM";
  createdAt: string;
}

// In-Memory storage for offline development and deterministic testing
const inMemoryAssessments = new Map<string, QuillAssessment>();
const inMemorySubmissions = new Map<string, AssessmentSubmission>();
const inMemoryEvidenceArtifacts = new Map<string, VerifiableEvidenceArtifact>();

// Standardized Rubrics
const systemDesignRubric: RubricCriterion[] = [
  { id: "crit_arch", name: "Architecture & Modularity", description: "Clear boundaries, interfaces, and decoupling", weight: 0.30, maxScore: 5 },
  { id: "crit_sec", name: "Security & Threat Mitigation", description: "Input sanitization, auth validation, and zero trust", weight: 0.30, maxScore: 5 },
  { id: "crit_perf", name: "Scalability & Performance", description: "Bottleneck avoidance, caching, and rate limiting", weight: 0.20, maxScore: 5 },
  { id: "crit_test", name: "Testability & Verification", description: "Unit/integration test coverage and failure recovery", weight: 0.20, maxScore: 5 },
];

const frontendRubric: RubricCriterion[] = [
  { id: "crit_comp", name: "Component Design & Reusability", description: "Composable, accessible UI primitives", weight: 0.35, maxScore: 5 },
  { id: "crit_state", name: "State Architecture", description: "Predictable state flow, caching, and reactivity", weight: 0.25, maxScore: 5 },
  { id: "crit_a11y", name: "Accessibility & Performance", description: "WCAG AA compliance and sub-second rendering", weight: 0.20, maxScore: 5 },
  { id: "crit_types", name: "Type Safety", description: "Strict TypeScript types with zero 'any' leaks", weight: 0.20, maxScore: 5 },
];

// Seed realistic demo assessments (DEMO / simulated)
const demoAssessments: QuillAssessment[] = [
  {
    id: "quill-assess-syssec-001",
    title: "Secure Distributed Systems Architecture (DEMO / simulated)",
    category: "Architecture & Security",
    description: "Design an end-to-end multi-tenant authentication and cryptographic evidence pipeline.",
    linkedSkillIds: ["skill_arch", "skill_sec", "skill_ts"],
    rubric: systemDesignRubric,
    passingScore: 70,
    submissionsCount: 4,
  },
  {
    id: "quill-assess-frontend-002",
    title: "Next.js & React Design System Engineering (DEMO / simulated)",
    category: "Web Frameworks",
    description: "Construct an accessible component library with deterministic theme tokens and zero runtime errors.",
    linkedSkillIds: ["skill_react", "skill_nextjs", "skill_tailwind", "skill_ts"],
    rubric: frontendRubric,
    passingScore: 75,
    submissionsCount: 6,
  },
];

for (const a of demoAssessments) {
  inMemoryAssessments.set(a.id, a);
}

// Seed realistic demo evidence artifact (DEMO / simulated)
const initialContent = "export function verifySignature(payload: string, key: string): boolean {\n  return crypto.verify(payload, key);\n}";
const initialHash = computeArtifactFingerprint(initialContent);

const demoEvidence: VerifiableEvidenceArtifact = {
  id: "ev-artifact-001",
  authorId: "candidate-alex-chen",
  title: "Cryptographic HMAC Verifier Module (DEMO / simulated)",
  content: initialContent,
  artifactSha256: initialHash,
  linkedSkillIds: ["skill_ts", "skill_sec"],
  assessmentScore: 92,
  status: "VERIFIED",
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  verifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
};
inMemoryEvidenceArtifacts.set(demoEvidence.id, demoEvidence);

async function safeDbCall<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await Promise.race([
      call(),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 250)),
    ]);
  } catch {
    return null;
  }
}

/**
 * Searches ESCO skills taxonomy with normalization
 */
export async function searchSkillsTaxonomy(query: string) {
  if (!query.trim()) {
    return ESCO_SKILLS_TAXONOMY;
  }
  const normalized = normalizeSkill(query);
  if (normalized.normalized && normalized.skill) {
    return [normalized.skill];
  }
  const q = query.toLowerCase();
  return ESCO_SKILLS_TAXONOMY.filter(
    (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  );
}

/**
 * Retrieves all available assessments
 */
export async function getAssessments(): Promise<QuillAssessment[]> {
  return Array.from(inMemoryAssessments.values());
}

/**
 * Retrieves single assessment with rubric
 */
export async function getAssessmentById(id: string): Promise<QuillAssessment | null> {
  return inMemoryAssessments.get(id) || null;
}

/**
 * Submits an assessment solution with collision (plagiarism) pre-check
 */
export async function submitAssessmentSolution({
  assessmentId,
  candidateId,
  candidateName,
  artifactContent,
}: {
  assessmentId: string;
  candidateId: string;
  candidateName: string;
  artifactContent: string;
}): Promise<AssessmentSubmission> {
  const assessment = inMemoryAssessments.get(assessmentId);
  if (!assessment) throw new Error("Assessment not found");

  // Check collision against all existing submissions
  for (const sub of inMemorySubmissions.values()) {
    const similarity = calculateContentSimilarity(artifactContent, sub.artifactContent);
    if (similarity >= 0.85) {
      throw new Error(`Collision alert: Submission exhibits ${Math.round(similarity * 100)}% verbatim similarity with existing artifact ${sub.id}.`);
    }
  }

  const hash = computeArtifactFingerprint(artifactContent);
  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const submission: AssessmentSubmission = {
    id: submissionId,
    assessmentId,
    candidateId,
    candidateName,
    artifactContent,
    artifactSha256: hash,
    reviews: [],
    status: "PENDING_REVIEW",
    createdAt: new Date().toISOString(),
  };

  inMemorySubmissions.set(submissionId, submission);

  await logAuditEvent({
    actorId: candidateId,
    action: "QUILL_ASSESSMENT_SUBMITTED",
    entityType: "ASSESSMENT_SUBMISSION",
    entityId: submissionId,
    metadata: { assessmentId, artifactSha256: hash },
  });

  return submission;
}

/**
 * Evaluates an assessment submission using the rubric.
 * Triggers peer consensus and generates verified evidence upon passing.
 */
export async function evaluateSubmission({
  submissionId,
  reviewerId,
  reviewerName,
  scores,
}: {
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  scores: RubricEvaluationItem[];
}): Promise<{
  submission: AssessmentSubmission;
  evaluationResult: RubricScoreResult;
  consensusResult: PeerReviewConsensusResult;
  generatedEvidence?: VerifiableEvidenceArtifact;
}> {
  const submission = inMemorySubmissions.get(submissionId);
  if (!submission) throw new Error("Submission not found");

  if (submission.candidateId === reviewerId) {
    throw new Error("Reviewers cannot evaluate their own submissions");
  }

  const assessment = inMemoryAssessments.get(submission.assessmentId);
  if (!assessment) throw new Error("Linked assessment not found");

  const evalResult = calculateRubricScore(assessment.rubric, scores, assessment.passingScore);

  // Add review
  submission.reviews.push({
    reviewerId,
    reviewerName,
    scores,
    totalScore: evalResult.totalScore,
    submittedAt: new Date().toISOString(),
  });

  // Calculate peer consensus across reviews
  const consensus = calculatePeerConsensus(
    submission.reviews.map((r) => ({ reviewerId: r.reviewerId, score: r.totalScore }))
  );

  let generatedEvidence: VerifiableEvidenceArtifact | undefined;

  // If consensus reached and median score >= passing score, promote to PASSED and issue evidence
  if (consensus.consensusReached && consensus.medianScore >= assessment.passingScore) {
    submission.status = "PASSED";
    submission.consensusScore = consensus.medianScore;

    const evidenceId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    generatedEvidence = {
      id: evidenceId,
      authorId: submission.candidateId,
      title: `${assessment.title} - Verified Assessment Artifact`,
      content: submission.artifactContent,
      artifactSha256: submission.artifactSha256,
      linkedSkillIds: assessment.linkedSkillIds,
      assessmentScore: consensus.medianScore,
      status: "VERIFIED",
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    };

    inMemoryEvidenceArtifacts.set(evidenceId, generatedEvidence);

    // Notify candidate
    await createOrbitModNotification({
      userId: submission.candidateId,
      type: "VERIFICATION_STATUS",
      title: `Assessment Verified: ${assessment.title}`,
      body: `You passed with an audited score of ${consensus.medianScore}%. Cryptographic evidence artifact issued.`,
      link: `/mod/quill/evidence/${evidenceId}`,
      metadata: { evidenceId, score: consensus.medianScore },
    });
  } else if (consensus.consensusReached && consensus.medianScore < assessment.passingScore) {
    submission.status = "FAILED";
    submission.consensusScore = consensus.medianScore;
  }

  inMemorySubmissions.set(submissionId, submission);

  await logAuditEvent({
    actorId: reviewerId,
    action: "QUILL_REVIEW_SUBMITTED",
    entityType: "ASSESSMENT_SUBMISSION",
    entityId: submissionId,
    metadata: { score: evalResult.totalScore, consensusReached: consensus.consensusReached },
  });

  return {
    submission,
    evaluationResult: evalResult,
    consensusResult: consensus,
    generatedEvidence,
  };
}

/**
 * Generates a direct verifiable evidence artifact with SHA-256 fingerprint
 */
export async function createVerifiableEvidence({
  authorId,
  title,
  content,
  linkedSkillIds = [],
}: {
  authorId: string;
  title: string;
  content: string;
  linkedSkillIds?: string[];
}): Promise<VerifiableEvidenceArtifact> {
  const hash = computeArtifactFingerprint(content);
  const evidenceId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const artifact: VerifiableEvidenceArtifact = {
    id: evidenceId,
    authorId,
    title,
    content,
    artifactSha256: hash,
    linkedSkillIds,
    status: "SUBMITTED",
    createdAt: new Date().toISOString(),
  };

  inMemoryEvidenceArtifacts.set(evidenceId, artifact);

  await logAuditEvent({
    actorId: authorId,
    action: "QUILL_EVIDENCE_CREATED",
    entityType: "EVIDENCE_ARTIFACT",
    entityId: evidenceId,
    metadata: { artifactSha256: hash, linkedSkillIds },
  });

  return artifact;
}

/**
 * Retrieves and audits an evidence artifact's cryptographic integrity
 */
export async function getEvidenceArtifact(
  id: string
): Promise<{ artifact: VerifiableEvidenceArtifact | null; isValidIntegrity: boolean }> {
  const artifact = inMemoryEvidenceArtifacts.get(id);
  if (!artifact) {
    return { artifact: null, isValidIntegrity: false };
  }

  const isValidIntegrity = verifyArtifactIntegrity(artifact.content, artifact.artifactSha256);
  return { artifact, isValidIntegrity };
}

export async function getAllEvidenceArtifacts(): Promise<VerifiableEvidenceArtifact[]> {
  return Array.from(inMemoryEvidenceArtifacts.values());
}

/**
 * Returns realistic Quill metrics
 */
export async function getQuillMetrics(): Promise<{
  totalAssessments: number;
  verifiedArtifactsCount: number;
  averageScore: number;
  normalizedSkillsCount: number;
}> {
  const totalAssessments = inMemoryAssessments.size;
  const verifiedArtifacts = Array.from(inMemoryEvidenceArtifacts.values()).filter(
    (e) => e.status === "VERIFIED"
  );
  const totalScore = verifiedArtifacts.reduce((sum, e) => sum + (e.assessmentScore || 80), 0);
  const averageScore = verifiedArtifacts.length > 0 ? Math.round(totalScore / verifiedArtifacts.length) : 85;

  return {
    totalAssessments,
    verifiedArtifactsCount: verifiedArtifacts.length,
    averageScore,
    normalizedSkillsCount: ESCO_SKILLS_TAXONOMY.length,
  };
}
