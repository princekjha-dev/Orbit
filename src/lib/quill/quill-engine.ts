/**
 * ORBITMOD V5 - QUILL SKILLS, ASSESSMENTS & EVIDENCE ENGINE
 * Pure deterministic algorithms for skill taxonomy normalization,
 * rubric scoring, SHA-256 evidence fingerprinting, and content collision detection.
 * 
 * INVARIANT: AI NEVER scores assessments or validates credentials.
 * Rubrics, SHA-256 hashes, and consensus algorithms are 100% deterministic.
 */

import { createHash } from "crypto";

export const ESCO_SKILLS_TAXONOMY: Array<{ id: string; name: string; category: string; aliases: string[] }> = [
  { id: "skill_ts", name: "TypeScript", category: "Programming Languages", aliases: ["ts", "typescript lang", "typed javascript"] },
  { id: "skill_js", name: "JavaScript", category: "Programming Languages", aliases: ["js", "ecmascript"] },
  { id: "skill_py", name: "Python", category: "Programming Languages", aliases: ["python3", "py"] },
  { id: "skill_react", name: "React", category: "Web Frameworks", aliases: ["react.js", "reactjs"] },
  { id: "skill_nextjs", name: "Next.js", category: "Web Frameworks", aliases: ["next", "nextjs"] },
  { id: "skill_nodejs", name: "Node.js", category: "Backend Runtime", aliases: ["node", "nodejs"] },
  { id: "skill_pg", name: "PostgreSQL", category: "Databases", aliases: ["postgres", "pgsql"] },
  { id: "skill_sql", name: "SQL", category: "Databases", aliases: ["relational sql", "ansi sql"] },
  { id: "skill_docker", name: "Docker", category: "DevOps & Cloud", aliases: ["containers", "docker engine"] },
  { id: "skill_graphql", name: "GraphQL", category: "API Design", aliases: ["gql"] },
  { id: "skill_tailwind", name: "Tailwind CSS", category: "UI & Styling", aliases: ["tailwind", "tailwindcss"] },
  { id: "skill_rest", name: "REST APIs", category: "API Design", aliases: ["restful api", "rest"] },
  { id: "skill_arch", name: "System Architecture", category: "Architecture & Security", aliases: ["distributed systems", "system design"] },
  { id: "skill_sec", name: "Security Auditing", category: "Architecture & Security", aliases: ["appsec", "penetration testing", "vuln assessment"] },
  { id: "skill_figma", name: "Figma", category: "Design", aliases: ["figma design", "ui wireframing"] },
];

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // e.g. 0.25
  maxScore: number; // e.g. 5
}

export interface RubricEvaluationItem {
  criterionId: string;
  score: number; // 1 to maxScore
  feedbackNotes?: string;
}

export interface RubricScoreResult {
  totalScore: number; // 0 - 100
  passed: boolean;
  breakdown: Array<{
    criterionId: string;
    rawScore: number;
    weight: number;
    weightedPoints: number;
  }>;
}

export interface PeerReviewConsensusResult {
  medianScore: number; // 0 - 100
  consensusReached: boolean;
  divergentReviewers: string[];
  reviewsCount: number;
}

export interface VerifiableEvidenceArtifact {
  id: string;
  authorId: string;
  title: string;
  content: string;
  artifactSha256: string;
  linkedSkillIds: string[];
  assessmentScore?: number;
  status: "DRAFT" | "SUBMITTED" | "VERIFIED" | "REVOKED";
  createdAt: string;
  verifiedAt?: string;
  expiresAt?: string;
}

/**
 * Normalizes input skill string against ESCO taxonomy
 */
export function normalizeSkill(input: string): {
  normalized: boolean;
  skill?: (typeof ESCO_SKILLS_TAXONOMY)[number];
  suggestedName: string;
} {
  const clean = input.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!clean) {
    return { normalized: false, suggestedName: input.trim() };
  }

  // Exact name match
  for (const skill of ESCO_SKILLS_TAXONOMY) {
    const skillNorm = skill.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (skillNorm === clean) {
      return { normalized: true, skill, suggestedName: skill.name };
    }
  }

  // Alias match
  for (const skill of ESCO_SKILLS_TAXONOMY) {
    for (const alias of skill.aliases) {
      const aliasNorm = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (aliasNorm === clean) {
        return { normalized: true, skill, suggestedName: skill.name };
      }
    }
  }

  // Substring fallback
  for (const skill of ESCO_SKILLS_TAXONOMY) {
    const skillNorm = skill.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (skillNorm.includes(clean) || clean.includes(skillNorm)) {
      return { normalized: true, skill, suggestedName: skill.name };
    }
  }

  return { normalized: false, suggestedName: input.trim() };
}

/**
 * Standard Rubric Evaluator
 * Weights must sum to 1.00. Evaluates criteria on 1-maxScore scale, normalized to [0, 100].
 */
export function calculateRubricScore(
  rubric: RubricCriterion[],
  evaluations: RubricEvaluationItem[],
  passingThreshold: number = 70
): RubricScoreResult {
  if (rubric.length === 0) {
    return { totalScore: 0, passed: false, breakdown: [] };
  }

  const evalMap = new Map<string, number>();
  for (const item of evaluations) {
    evalMap.set(item.criterionId, item.score);
  }

  const breakdown: RubricScoreResult["breakdown"] = [];
  let totalPoints = 0;

  for (const crit of rubric) {
    const raw = evalMap.get(crit.id) ?? 1;
    const boundedRaw = Math.min(crit.maxScore, Math.max(1, raw));
    const normalizedCriterionRatio = (boundedRaw - 1) / Math.max(1, crit.maxScore - 1); // 0.0 to 1.0
    const weightedPoints = normalizedCriterionRatio * 100 * crit.weight;

    breakdown.push({
      criterionId: crit.id,
      rawScore: boundedRaw,
      weight: crit.weight,
      weightedPoints: Math.round(weightedPoints * 10) / 10,
    });

    totalPoints += weightedPoints;
  }

  const totalScore = Math.min(100, Math.max(0, Math.round(totalPoints)));
  return {
    totalScore,
    passed: totalScore >= passingThreshold,
    breakdown,
  };
}

/**
 * Calculates consensus across peer reviewers
 * Minimum 2 reviews required. Calculates median score and detects outliers (>15 pts divergence).
 */
export function calculatePeerConsensus(
  reviews: Array<{ reviewerId: string; score: number }>,
  maxAllowedDivergence: number = 15
): PeerReviewConsensusResult {
  if (reviews.length < 2) {
    return {
      medianScore: reviews[0]?.score ?? 0,
      consensusReached: false,
      divergentReviewers: [],
      reviewsCount: reviews.length,
    };
  }

  const scores = reviews.map((r) => r.score).sort((a, b) => a - b);
  const mid = Math.floor(scores.length / 2);
  const median =
    scores.length % 2 === 0
      ? Math.round((scores[mid - 1] + scores[mid]) / 2)
      : scores[mid];

  const divergentReviewers: string[] = [];
  for (const r of reviews) {
    if (Math.abs(r.score - median) > maxAllowedDivergence) {
      divergentReviewers.push(r.reviewerId);
    }
  }

  return {
    medianScore: median,
    consensusReached: divergentReviewers.length === 0,
    divergentReviewers,
    reviewsCount: reviews.length,
  };
}

/**
 * Computes deterministic SHA-256 hash of an artifact's content
 */
export function computeArtifactFingerprint(content: string): string {
  const normalizedContent = content.trim().replace(/\r\n/g, "\n");
  return createHash("sha256").update(normalizedContent, "utf8").digest("hex");
}

/**
 * Verifies if an artifact's content matches its registered SHA-256 fingerprint
 */
export function verifyArtifactIntegrity(content: string, expectedHash: string): boolean {
  const computed = computeArtifactFingerprint(content);
  return computed.toLowerCase() === expectedHash.trim().toLowerCase();
}

/**
 * Jaccard 3-gram Similarity Collision Detector (Plagiarism Detection)
 * Returns similarity ratio in [0.0, 1.0].
 */
export function calculateContentSimilarity(textA: string, textB: string): number {
  const normA = textA.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const normB = textB.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);

  if (normA.length === 0 || normB.length === 0) return 0;

  // Generate 3-word shingles
  const getShingles = (words: string[]): Set<string> => {
    const shingles = new Set<string>();
    if (words.length < 3) {
      shingles.add(words.join(" "));
      return shingles;
    }
    for (let i = 0; i <= words.length - 3; i++) {
      shingles.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    return shingles;
  };

  const shinglesA = getShingles(normA);
  const shinglesB = getShingles(normB);

  let intersection = 0;
  for (const s of shinglesA) {
    if (shinglesB.has(s)) intersection++;
  }

  const union = shinglesA.size + shinglesB.size - intersection;
  return union > 0 ? Math.round((intersection / union) * 100) / 100 : 0;
}
