/**
 * ORBITMOD V5 - RELAY COMMUNITY, MESSAGING & SAFETY ENGINE
 * Pure deterministic algorithms for Community Notes scoring,
 * off-platform contact detection, and neutral moderation copy validation.
 * 
 * INVARIANT: AI NEVER censors messages or rates Community Notes.
 * Formula is 100% deterministic and mathematically auditable.
 */

export type CommunityNoteStatus =
  | "PROPOSED"
  | "NEEDS_MORE_RATINGS"
  | "CURRENTLY_RATED_HELPFUL"
  | "CURRENTLY_RATED_NOT_HELPFUL";

export type NoteRatingType = "HELPFUL" | "SOMEWHAT_HELPFUL" | "NOT_HELPFUL";

export interface CommunityNote {
  id: string;
  targetEntityType: "OPPORTUNITY" | "ORGANIZATION" | "USER_PROFILE";
  targetEntityId: string;
  authorId: string;
  content: string; // Factual context explanation
  evidenceLinks: string[];
  ratings: Array<{
    raterId: string;
    rating: NoteRatingType;
    ratedAt: string;
  }>;
  status: CommunityNoteStatus;
  helpfulnessScore: number; // 0.0 - 1.0
  createdAt: string;
}

export interface OffPlatformContactDetection {
  hasOffPlatformRisk: boolean;
  detectedPatterns: string[];
  warningMessage?: string;
}

/**
 * Defamatory / Accusatory words that violate the neutral copy rule.
 * Orbit policy requires objective, evidence-based descriptions
 * (e.g. "unable to confirm registration" instead of "fake scam company").
 */
const BANNED_ACCUSATORY_TERMS = [
  "scam",
  "scammer",
  "scammers",
  "fraud",
  "fraudster",
  "criminal",
  "thief",
  "con artist",
  "rip off",
  "fake company",
  "illegitimate",
];

/**
 * Validates that Community Note content adheres to neutral, objective tone standards.
 */
export function validateNeutralTone(content: string): { valid: boolean; flaggedTerm?: string; reason?: string } {
  const lower = content.toLowerCase();

  for (const term of BANNED_ACCUSATORY_TERMS) {
    const regex = new RegExp(`\\b${term}(?:s|ed|ing)?\\b`, "i");
    if (regex.test(lower)) {
      return {
        valid: false,
        flaggedTerm: term,
        reason: `Violates neutral tone guidelines. Avoid accusing labels like "${term}". Use factual descriptions such as "unable to confirm registration" or "unverified external link".`,
      };
    }
  }

  return { valid: true };
}

/**
 * Deterministic Community Notes Helpfulness Scoring Algorithm
 * Formula: Score = (Helpful + 0.5 * Somewhat) / (Helpful + Somewhat + NotHelpful)
 * Requires minimum 3 ratings for conclusive status.
 */
export function calculateNoteHelpfulness(
  ratings: CommunityNote["ratings"]
): { helpfulnessScore: number; status: CommunityNoteStatus } {
  if (ratings.length === 0) {
    return { helpfulnessScore: 0, status: "PROPOSED" };
  }

  let helpfulCount = 0;
  let somewhatCount = 0;
  let notHelpfulCount = 0;

  for (const r of ratings) {
    if (r.rating === "HELPFUL") helpfulCount++;
    else if (r.rating === "SOMEWHAT_HELPFUL") somewhatCount++;
    else if (r.rating === "NOT_HELPFUL") notHelpfulCount++;
  }

  const total = helpfulCount + somewhatCount + notHelpfulCount;
  const rawScore = (helpfulCount + 0.5 * somewhatCount) / total;
  const helpfulnessScore = Math.round(rawScore * 100) / 100;

  if (total < 3) {
    return { helpfulnessScore, status: "NEEDS_MORE_RATINGS" };
  }

  if (helpfulnessScore >= 0.65) {
    return { helpfulnessScore, status: "CURRENTLY_RATED_HELPFUL" };
  } else {
    return { helpfulnessScore, status: "CURRENTLY_RATED_NOT_HELPFUL" };
  }
}

/**
 * Deterministic Off-Platform Contact & Safety Detector
 * Inspects chat messages for suspicious solicitations to shift communication off-platform
 * (e.g. Telegram, WhatsApp handles, external crypto/wire payments).
 */
export function detectOffPlatformSolicitation(text: string): OffPlatformContactDetection {
  const detectedPatterns: string[] = [];

  // Telegram handles and t.me links
  if (/t\.me\/[a-z0-9_]+/i.test(text) || /\btelegram\b/i.test(text)) {
    detectedPatterns.push("Telegram redirection handle or link");
  }

  // WhatsApp links / phone solicitation
  if (/wa\.me\/[0-9]+/i.test(text) || /\bwhatsapp\b/i.test(text)) {
    detectedPatterns.push("WhatsApp off-platform redirection");
  }

  // Signal or Discord handle solicitation
  if (/\b(?:discord|signal)\s*[:@]\s*[a-z0-9_]+/i.test(text)) {
    detectedPatterns.push("External chat service handle");
  }

  // Upfront fee / cryptocurrency / wire solicitation
  if (/\b(?:send|wire|transfer|pay)\s*(?:usdt|crypto|bitcoin|fee|deposit|money)\b/i.test(text)) {
    detectedPatterns.push("Upfront payment or crypto deposit solicitation");
  }

  const hasOffPlatformRisk = detectedPatterns.length > 0;
  const warningMessage = hasOffPlatformRisk
    ? "Safety Notice: This message contains an invitation to communicate or send funds outside the Orbit platform. Legitimate opportunities never charge upfront fees or insist on unmonitored messaging."
    : undefined;

  return {
    hasOffPlatformRisk,
    detectedPatterns,
    warningMessage,
  };
}
