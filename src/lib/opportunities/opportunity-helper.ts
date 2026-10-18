import { extractUrls } from "@/lib/security/content-sanitizer";

export type OpportunityTrustStatus = "VERIFIED_EMPLOYER" | "NEEDS_REVIEW" | "UNVERIFIED" | "SUSPICIOUS";

export interface FormattedOpportunityTrust {
  status: OpportunityTrustStatus;
  badgeLabel: string;
  badgeClass: string;
  reasons: string[];
  externalUrlsCount: number;
  hasShortenerUrl: boolean;
}

/**
 * Determines the deterministic trust status of an opportunity based on organization verification,
 * domain match, fee requests, and extracted links.
 */
export function evaluateOpportunityTrust(opportunity: {
  id: string;
  title: string;
  description: string;
  organization?: {
    verificationStatus?: string;
    website?: string | null;
  } | null;
  isVerified?: boolean;
}): FormattedOpportunityTrust {
  const reasons: string[] = [];

  // Check 1: Fee request heuristic in text (registration fee, security deposit, payment upfront)
  const feePatterns = [
    /\bregistration fee\b/i,
    /\bsecurity deposit\b/i,
    /\bprocessing fee\b/i,
    /\bpay upfront\b/i,
    /\bapplication charge\b/i,
    /\btransfer money\b/i,
  ];

  const hasFeeRequest = feePatterns.some((pattern) => pattern.test(opportunity.description));
  if (hasFeeRequest) {
    reasons.push("Opportunity description mentions registration fee or upfront payment requirement");
  }

  // Check 2: Extract external links and check for shorteners
  const extracted = extractUrls(opportunity.description);
  const hasShortener = extracted.some((e) => e.isShortener);
  if (hasShortener) {
    reasons.push("Contains URL shortener link which obscures actual destination");
  }

  // Check 3: Organization verification status
  const orgStatus = opportunity.organization?.verificationStatus || "UNVERIFIED";

  let status: OpportunityTrustStatus = "UNVERIFIED";

  if (hasFeeRequest) {
    status = "NEEDS_REVIEW";
  } else if (hasShortener) {
    status = "NEEDS_REVIEW";
  } else if (orgStatus === "VERIFIED" || opportunity.isVerified) {
    status = "VERIFIED_EMPLOYER";
    reasons.push("Published by verified organization with confirmed domain ownership");
  } else if (orgStatus === "PENDING") {
    status = "NEEDS_REVIEW";
    reasons.push("Organization verification documents are currently under review");
  } else {
    status = "UNVERIFIED";
    reasons.push("Organization domain has not been verified yet");
  }

  const badgeMap: Record<OpportunityTrustStatus, { label: string; class: string }> = {
    VERIFIED_EMPLOYER: {
      label: "Verified Employer",
      class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    NEEDS_REVIEW: {
      label: "Needs Review",
      class: "bg-amber-50 text-amber-700 border-amber-200",
    },
    UNVERIFIED: {
      label: "Unverified Publisher",
      class: "bg-neutral-100 text-neutral-600 border-neutral-200",
    },
    SUSPICIOUS: {
      label: "Risk Indicator",
      class: "bg-red-50 text-red-700 border-red-200",
    },
  };

  return {
    status,
    badgeLabel: badgeMap[status].label,
    badgeClass: badgeMap[status].class,
    reasons,
    externalUrlsCount: extracted.length,
    hasShortenerUrl: hasShortener,
  };
}
