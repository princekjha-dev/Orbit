/**
 * ORBITMOD V5 - SCOUT MATCHING & TEAM ENGINE
 * Pure deterministic algorithms for candidate-opportunity matching,
 * slot allocation, and fair-exposure capping.
 * 
 * INVARIANT: AI NEVER scores, ranks, or matches candidates.
 * Formula is 100% deterministic and mathematically auditable:
 * Score = 0.35 * SkillMatch + 0.25 * Availability + 0.20 * InterestRole + 0.10 * Timezone + 0.10 * EvidenceConfidence
 */

export interface CandidateProfile {
  id: string;
  name: string;
  headline?: string;
  avatarUrl?: string;
  skills: Array<{ name: string; level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"; verified?: boolean }>;
  availabilityHoursPerWeek: number;
  rolesInterested: string[];
  timezoneOffsetHours: number; // e.g. -5 for EST, 0 for UTC, +5.5 for IST
  evidenceCount: number;
  discoveryStatus: "ACTIVE" | "PASSIVE" | "OFF";
}

export interface OpportunityRequirements {
  id: string;
  title: string;
  organizationName: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  targetHoursPerWeek: number;
  targetRole: string;
  targetTimezoneOffsetHours?: number; // Organization's working timezone
  maxTimezoneDeltaHours?: number;
}

export interface MatchBreakdown {
  totalScore: number; // 0 - 100
  signals: {
    skillMatch: { score: number; weight: 0.35; weightedScore: number; matchedSkills: string[]; missingSkills: string[] };
    availability: { score: number; weight: 0.25; weightedScore: number; candidateHours: number; targetHours: number };
    interestRole: { score: number; weight: 0.20; weightedScore: number; matchedRole: boolean };
    timezone: { score: number; weight: 0.10; weightedScore: number; deltaHours: number };
    evidence: { score: number; weight: 0.10; weightedScore: number; verifiedEvidenceCount: number };
  };
  isEligible: boolean;
  explanation: string;
}

export interface TeamSlotRequirement {
  slotId: string;
  roleName: string;
  requiredSkills: string[];
}

export interface TeamAllocationResult {
  assignedSlots: Array<{
    slotId: string;
    roleName: string;
    candidateId: string;
    candidateName: string;
    fitScore: number;
  }>;
  unassignedSlots: Array<{
    slotId: string;
    roleName: string;
    missingSkills: string[];
  }>;
  unassignedCandidates: Array<{
    candidateId: string;
    candidateName: string;
  }>;
  teamCoverageScore: number; // 0 - 100
}

/**
 * Normalizes string for fuzzy/case-insensitive matching
 */
function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * 1. Skill Match Signal (0 - 100)
 * Evaluates overlap between candidate skills and required/preferred skills.
 * Verified skills carry a 1.2x multiplier bonus (capped at 100).
 */
export function calculateSkillScore(
  candidateSkills: CandidateProfile["skills"],
  requiredSkills: string[],
  preferredSkills: string[] = []
): { score: number; matchedSkills: string[]; missingSkills: string[] } {
  if (requiredSkills.length === 0) {
    return { score: 100, matchedSkills: [], missingSkills: [] };
  }

  const candidateSkillMap = new Map<string, { verified: boolean }>();
  for (const s of candidateSkills) {
    candidateSkillMap.set(normalize(s.name), { verified: !!s.verified });
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let pointsEarned = 0;
  const pointPerReq = 100 / requiredSkills.length;

  for (const req of requiredSkills) {
    const key = normalize(req);
    const found = candidateSkillMap.get(key);
    if (found) {
      matchedSkills.push(req);
      const bonus = found.verified ? 1.2 : 1.0;
      pointsEarned += pointPerReq * bonus;
    } else {
      missingSkills.push(req);
    }
  }

  // Bonus for preferred skills (up to 15 bonus points, capped at 100)
  if (preferredSkills.length > 0) {
    let prefBonus = 0;
    for (const pref of preferredSkills) {
      if (candidateSkillMap.has(normalize(pref))) {
        prefBonus += 15 / preferredSkills.length;
      }
    }
    pointsEarned += prefBonus;
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(pointsEarned)));
  return { score: finalScore, matchedSkills, missingSkills };
}

/**
 * 2. Availability Match Signal (0 - 100)
 * Evaluates candidate hours vs target opportunity hours.
 */
export function calculateAvailabilityScore(
  candidateHours: number,
  targetHours: number
): { score: number; candidateHours: number; targetHours: number } {
  if (targetHours <= 0) return { score: 100, candidateHours, targetHours };
  if (candidateHours <= 0) return { score: 0, candidateHours, targetHours };

  // Perfect if within 20% of target
  const ratio = candidateHours / targetHours;
  let score = 0;

  if (ratio >= 0.8 && ratio <= 1.25) {
    score = 100;
  } else if (ratio < 0.8) {
    score = Math.max(0, Math.round(ratio * 100));
  } else {
    // Overcommitted (> 1.25x target), gentle penalty
    score = Math.max(50, Math.round(100 - (ratio - 1.25) * 40));
  }

  return { score: Math.min(100, score), candidateHours, targetHours };
}

/**
 * 3. Interest & Role Alignment Signal (0 - 100)
 * Evaluates if candidate's stated interested roles match opportunity target role.
 */
export function calculateInterestRoleScore(
  candidateRoles: string[],
  targetRole: string
): { score: number; matchedRole: boolean } {
  const targetNorm = normalize(targetRole);
  const matched = candidateRoles.some(
    (r) => normalize(r) === targetNorm || normalize(r).includes(targetNorm) || targetNorm.includes(normalize(r))
  );

  return {
    score: matched ? 100 : candidateRoles.length > 0 ? 30 : 50,
    matchedRole: matched,
  };
}

/**
 * 4. Timezone Overlap Signal (0 - 100)
 * Evaluates timezone delta in hours.
 */
export function calculateTimezoneScore(
  candidateOffset: number,
  targetOffset: number = 0,
  maxDeltaAllowed: number = 6
): { score: number; deltaHours: number } {
  const delta = Math.abs(candidateOffset - targetOffset);
  if (delta === 0) return { score: 100, deltaHours: 0 };
  if (delta <= 2) return { score: 95, deltaHours: delta };
  if (delta <= 4) return { score: 85, deltaHours: delta };
  if (delta <= maxDeltaAllowed) {
    const penalty = ((delta - 4) / (maxDeltaAllowed - 4)) * 35;
    return { score: Math.max(50, Math.round(85 - penalty)), deltaHours: delta };
  }

  // Delta exceeds allowed timezone range
  const severePenalty = Math.max(10, Math.round(50 - (delta - maxDeltaAllowed) * 10));
  return { score: severePenalty, deltaHours: delta };
}

/**
 * 5. Evidence Confidence Signal (0 - 100)
 * Evaluates depth of verified evidence items attached to candidate passport.
 */
export function calculateEvidenceScore(evidenceCount: number): { score: number; verifiedEvidenceCount: number } {
  if (evidenceCount <= 0) return { score: 20, verifiedEvidenceCount: 0 };
  if (evidenceCount === 1) return { score: 55, verifiedEvidenceCount: 1 };
  if (evidenceCount === 2) return { score: 75, verifiedEvidenceCount: 2 };
  if (evidenceCount >= 3) return { score: Math.min(100, 85 + (evidenceCount - 3) * 5), verifiedEvidenceCount: evidenceCount };
  return { score: 20, verifiedEvidenceCount: 0 };
}

/**
 * MAIN DETERMINISTIC SCOUT MATCHING FORMULA
 * Score = 0.35 * Skill + 0.25 * Avail + 0.20 * Role + 0.10 * Timezone + 0.10 * Evidence
 */
export function calculateScoutMatch(
  candidate: CandidateProfile,
  opportunity: OpportunityRequirements
): MatchBreakdown {
  if (candidate.discoveryStatus === "OFF") {
    return {
      totalScore: 0,
      signals: {
        skillMatch: { score: 0, weight: 0.35, weightedScore: 0, matchedSkills: [], missingSkills: opportunity.requiredSkills },
        availability: { score: 0, weight: 0.25, weightedScore: 0, candidateHours: 0, targetHours: opportunity.targetHoursPerWeek },
        interestRole: { score: 0, weight: 0.20, weightedScore: 0, matchedRole: false },
        timezone: { score: 0, weight: 0.10, weightedScore: 0, deltaHours: 0 },
        evidence: { score: 0, weight: 0.10, weightedScore: 0, verifiedEvidenceCount: 0 },
      },
      isEligible: false,
      explanation: "Candidate has disabled discovery mode.",
    };
  }

  const skill = calculateSkillScore(candidate.skills, opportunity.requiredSkills, opportunity.preferredSkills);
  const avail = calculateAvailabilityScore(candidate.availabilityHoursPerWeek, opportunity.targetHoursPerWeek);
  const interest = calculateInterestRoleScore(candidate.rolesInterested, opportunity.targetRole);
  const tz = calculateTimezoneScore(
    candidate.timezoneOffsetHours,
    opportunity.targetTimezoneOffsetHours ?? 0,
    opportunity.maxTimezoneDeltaHours ?? 6
  );
  const evidence = calculateEvidenceScore(candidate.evidenceCount);

  const weightedSkill = skill.score * 0.35;
  const weightedAvail = avail.score * 0.25;
  const weightedInterest = interest.score * 0.20;
  const weightedTz = tz.score * 0.10;
  const weightedEvidence = evidence.score * 0.10;

  const rawTotal = weightedSkill + weightedAvail + weightedInterest + weightedTz + weightedEvidence;
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  const isEligible = totalScore >= 45 && skill.matchedSkills.length > 0;
  const explanation = `${totalScore}% Match: ${skill.matchedSkills.length}/${opportunity.requiredSkills.length} skills (${skill.score}%), ` +
    `avail ${avail.candidateHours}h/${avail.targetHours}h (${avail.score}%), ` +
    `${interest.matchedRole ? "direct role alignment" : "adjacent role"} (${interest.score}%), ` +
    `tz ${tz.deltaHours}h delta (${tz.score}%), ` +
    `${evidence.verifiedEvidenceCount} verified evidence items (${evidence.score}%).`;

  return {
    totalScore,
    signals: {
      skillMatch: { score: skill.score, weight: 0.35, weightedScore: Math.round(weightedSkill * 10) / 10, matchedSkills: skill.matchedSkills, missingSkills: skill.missingSkills },
      availability: { score: avail.score, weight: 0.25, weightedScore: Math.round(weightedAvail * 10) / 10, candidateHours: avail.candidateHours, targetHours: avail.targetHours },
      interestRole: { score: interest.score, weight: 0.20, weightedScore: Math.round(weightedInterest * 10) / 10, matchedRole: interest.matchedRole },
      timezone: { score: tz.score, weight: 0.10, weightedScore: Math.round(weightedTz * 10) / 10, deltaHours: tz.deltaHours },
      evidence: { score: evidence.score, weight: 0.10, weightedScore: Math.round(weightedEvidence * 10) / 10, verifiedEvidenceCount: evidence.verifiedEvidenceCount },
    },
    isEligible,
    explanation,
  };
}

/**
 * GREEDY BIPARTITE SLOT ALLOCATION FOR BALANCED TEAMS
 * Allocates candidate pool to required team slots maximizing overall team coverage.
 * INVARIANT: A candidate can only be allocated to at most one slot.
 */
export function buildBalancedTeam(
  candidates: CandidateProfile[],
  slots: TeamSlotRequirement[],
  targetHoursPerWeek: number = 20
): TeamAllocationResult {
  const eligibleCandidates = candidates.filter((c) => c.discoveryStatus !== "OFF");
  const assignedSlots: TeamAllocationResult["assignedSlots"] = [];
  const unassignedSlots: TeamAllocationResult["unassignedSlots"] = [];
  const allocatedCandidateIds = new Set<string>();

  // For each slot, find best candidate by specialized match score
  for (const slot of slots) {
    let bestCandidate: CandidateProfile | null = null;
    let bestScore = -1;

    for (const candidate of eligibleCandidates) {
      if (allocatedCandidateIds.has(candidate.id)) continue;

      const match = calculateScoutMatch(candidate, {
        id: slot.slotId,
        title: slot.roleName,
        organizationName: "Team",
        requiredSkills: slot.requiredSkills,
        targetHoursPerWeek,
        targetRole: slot.roleName,
      });

      if (match.totalScore > bestScore && match.totalScore >= 35) {
        bestScore = match.totalScore;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate && bestScore >= 35) {
      allocatedCandidateIds.add(bestCandidate.id);
      assignedSlots.push({
        slotId: slot.slotId,
        roleName: slot.roleName,
        candidateId: bestCandidate.id,
        candidateName: bestCandidate.name,
        fitScore: bestScore,
      });
    } else {
      unassignedSlots.push({
        slotId: slot.slotId,
        roleName: slot.roleName,
        missingSkills: slot.requiredSkills,
      });
    }
  }

  const unassignedCandidates = eligibleCandidates
    .filter((c) => !allocatedCandidateIds.has(c.id))
    .map((c) => ({ candidateId: c.id, candidateName: c.name }));

  const slotCoverageRatio = slots.length > 0 ? assignedSlots.length / slots.length : 1;
  const avgFit =
    assignedSlots.length > 0
      ? assignedSlots.reduce((sum, s) => sum + s.fitScore, 0) / assignedSlots.length
      : 0;

  const teamCoverageScore = Math.round(slotCoverageRatio * 60 + (avgFit / 100) * 40);

  return {
    assignedSlots,
    unassignedSlots,
    unassignedCandidates,
    teamCoverageScore,
  };
}

/**
 * EXPOSURE CAP TRACKER
 * Prevents recruiter candidate scraping and ensures fair opportunity distribution.
 * Maximum 50 candidate profile reveals per recruiter per 24 hours.
 */
interface ExposureEntry {
  viewCount: number;
  resetAt: number; // timestamp ms
}

const recruiterExposureMap = new Map<string, ExposureEntry>();
const MAX_REVEALS_PER_24H = 50;
const WINDOW_24H_MS = 24 * 60 * 60 * 1000;

export function checkAndRecordExposure(
  recruiterId: string,
  candidateId: string
): { allowed: boolean; remainingReveals: number; resetsInHours: number } {
  const now = Date.now();
  let entry = recruiterExposureMap.get(recruiterId);

  if (!entry || now > entry.resetAt) {
    entry = { viewCount: 0, resetAt: now + WINDOW_24H_MS };
    recruiterExposureMap.set(recruiterId, entry);
  }

  const remaining = Math.max(0, MAX_REVEALS_PER_24H - entry.viewCount);
  const resetsInHours = Math.max(0, Math.round((entry.resetAt - now) / (1000 * 60 * 60)));

  if (entry.viewCount >= MAX_REVEALS_PER_24H) {
    return { allowed: false, remainingReveals: 0, resetsInHours };
  }

  entry.viewCount++;
  recruiterExposureMap.set(recruiterId, entry);

  return {
    allowed: true,
    remainingReveals: MAX_REVEALS_PER_24H - entry.viewCount,
    resetsInHours,
  };
}

export function resetExposureForTesting(): void {
  recruiterExposureMap.clear();
}
