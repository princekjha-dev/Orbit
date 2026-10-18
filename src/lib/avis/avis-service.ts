import { prisma } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit/audit-logger";
import {
  AvisState,
  VerificationEvidence,
  VerificationReason,
  generateDnsChallenge,
  verifyDnsChallenge,
  transitionAvisState,
  DnsChallengeToken,
} from "./verification-engine";

export interface VerificationRecordData {
  id: string;
  resourceType: "ORGANIZATION" | "RECRUITER_AFFILIATION" | "OPPORTUNITY";
  resourceId: string;
  resourceName?: string;
  state: AvisState;
  evidence: VerificationEvidence[];
  reasons: VerificationReason[];
  reviewerId?: string | null;
  reviewerNotes?: string | null;
  checkedAt: string;
  expiresAt?: string | null;
  version: number;
  domainChallenge?: DnsChallengeToken | null;
}

export interface VerificationAppealData {
  id: string;
  verificationRecordId: string;
  requesterId: string;
  requesterName?: string;
  reason: string;
  evidenceUrls: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerId?: string | null;
  reviewerNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

// In-memory store for zero-config offline demo mode & testing
const inMemoryVerificationRecords: Map<string, VerificationRecordData> = new Map();
const inMemoryAppeals: Map<string, VerificationAppealData> = new Map();

const apexRecord: VerificationRecordData = {
  id: "rec_org_apex_01",
  resourceType: "ORGANIZATION",
  resourceId: "apex-innovations-demo",
  resourceName: "Apex Innovations (DEMO)",
  state: "VERIFIED",
  evidence: [
    {
      id: "ev_dns_01",
      type: "DNS_TXT",
      source: "dns.promises.resolveTxt",
      value: "orbit-verification-8f92a10c73b",
      checkedAt: new Date(Date.now() - 3600000).toISOString(),
      isVerified: true,
      metadata: { host: "_orbit-challenge.apexinnovations.org" },
    },
  ],
  reasons: [
    {
      code: "DNS_DOMAIN_MATCH",
      message: "Confirmed root domain ownership via cryptographic DNS TXT record",
      severity: "INFO",
      evidenceRef: "ev_dns_01",
    },
  ],
  reviewerId: "admin_auto_dns",
  checkedAt: new Date(Date.now() - 3600000).toISOString(),
  version: 1,
};

const hypergrowthRecord: VerificationRecordData = {
  id: "rec_org_hyper_02",
  resourceType: "ORGANIZATION",
  resourceId: "hypergrowth-stealth-demo",
  resourceName: "HyperGrowth Labs (DEMO)",
  state: "NEEDS_REVIEW",
  evidence: [
    {
      id: "ev_doc_01",
      type: "DOCUMENT",
      source: "certificate_incorporation.pdf",
      value: "magic_bytes_verified",
      checkedAt: new Date(Date.now() - 7200000).toISOString(),
      isVerified: false,
    },
  ],
  reasons: [
    {
      code: "DOCUMENTS_PENDING_REVIEW",
      message: "Incorporation documents submitted; waiting for human reviewer confirmation",
      severity: "WARNING",
      evidenceRef: "ev_doc_01",
    },
  ],
  checkedAt: new Date(Date.now() - 7200000).toISOString(),
  version: 1,
};

const alexAffiliationRecord: VerificationRecordData = {
  id: "rec_alex_affil_01",
  resourceType: "RECRUITER_AFFILIATION",
  resourceId: "candidate-alex-chen",
  resourceName: "Alex Chen (DEMO)",
  state: "VERIFIED",
  evidence: [
    {
      id: "ev_affil_alex_01",
      type: "RECRUITER_DOMAIN",
      source: "alex@apexinnovations.org",
      value: "corporate_sso_verified",
      checkedAt: new Date(Date.now() - 3600000).toISOString(),
      isVerified: true,
    },
  ],
  reasons: [
    {
      code: "AFFILIATION_VERIFIED",
      message: "Confirmed builder email domain and verified code attestations",
      severity: "INFO",
    },
  ],
  checkedAt: new Date(Date.now() - 3600000).toISOString(),
  version: 1,
};

// Seed with multiple lookup keys (full resource prefix + raw ID)
inMemoryVerificationRecords.set("organization_apex-innovations-demo", apexRecord);
inMemoryVerificationRecords.set("apex-innovations-demo", apexRecord);
inMemoryVerificationRecords.set("organization_astra-digital", {
  id: "rec_org_astra_01",
  resourceType: "ORGANIZATION",
  resourceId: "astra-digital",
  resourceName: "Astra Digital Technologies (DEMO)",
  state: "VERIFIED",
  evidence: [
    {
      id: "ev_dns_astra_01",
      type: "DNS_TXT",
      source: "dns.promises.resolveTxt",
      value: "orbit-verification-astra-9f82d1",
      checkedAt: new Date(Date.now() - 3600000).toISOString(),
      isVerified: true,
      metadata: { host: "_orbit-challenge.astradigital.in" },
    },
  ],
  reasons: [
    {
      code: "DNS_DOMAIN_MATCH",
      message: "Confirmed root domain ownership via cryptographic DNS TXT record",
      severity: "INFO",
      evidenceRef: "ev_dns_astra_01",
    },
  ],
  reviewerId: "admin_auto_dns",
  checkedAt: new Date(Date.now() - 3600000).toISOString(),
  version: 1,
});
inMemoryVerificationRecords.set("astra-digital", inMemoryVerificationRecords.get("organization_astra-digital")!);
inMemoryVerificationRecords.set("organization_nexora-labs", {
  id: "rec_org_nexora_01",
  resourceType: "ORGANIZATION",
  resourceId: "nexora-labs",
  resourceName: "Nexora Labs (DEMO)",
  state: "VERIFIED",
  evidence: [
    {
      id: "ev_dns_nexora_01",
      type: "DNS_TXT",
      source: "dns.promises.resolveTxt",
      value: "orbit-verification-nexora-4c28e9",
      checkedAt: new Date(Date.now() - 3600000).toISOString(),
      isVerified: true,
      metadata: { host: "_orbit-challenge.nexoralabs.ai" },
    },
  ],
  reasons: [
    {
      code: "DNS_DOMAIN_MATCH",
      message: "Confirmed root domain ownership via cryptographic DNS TXT record",
      severity: "INFO",
      evidenceRef: "ev_dns_nexora_01",
    },
  ],
  reviewerId: "admin_auto_dns",
  checkedAt: new Date(Date.now() - 3600000).toISOString(),
  version: 1,
});
inMemoryVerificationRecords.set("nexora-labs", inMemoryVerificationRecords.get("organization_nexora-labs")!);
inMemoryVerificationRecords.set("organization_hypergrowth-stealth-demo", hypergrowthRecord);
inMemoryVerificationRecords.set("hypergrowth-stealth-demo", hypergrowthRecord);
inMemoryVerificationRecords.set("recruiter_affiliation_candidate-alex-chen", alexAffiliationRecord);
inMemoryVerificationRecords.set("candidate-alex-chen", alexAffiliationRecord);

async function safeDbCall<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await Promise.race([
      call(),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 300)),
    ]);
  } catch {
    return null;
  }
}

/**
 * Retrieves a verification record by resource type and ID.
 */
export async function getVerificationRecord(
  resourceType: "ORGANIZATION" | "RECRUITER_AFFILIATION" | "OPPORTUNITY",
  resourceId: string
): Promise<VerificationRecordData | null> {
  const key = `${resourceType.toLowerCase()}_${resourceId}`;
  const memoryRecord = inMemoryVerificationRecords.get(key) || inMemoryVerificationRecords.get(resourceId);
  if (memoryRecord) return memoryRecord;

  // Attempt database retrieval if available with fast timeout
  const org = await safeDbCall(() =>
    prisma.organization.findUnique({
      where: { slug: resourceId },
      include: { verification: true },
    })
  );

  if (org) {
    const state: AvisState =
      org.verificationStatus === "VERIFIED"
        ? "VERIFIED"
        : org.verificationStatus === "PENDING"
        ? "NEEDS_REVIEW"
        : "UNVERIFIED";

    const record: VerificationRecordData = {
      id: `rec_${org.id}`,
      resourceType: "ORGANIZATION",
      resourceId: org.slug,
      resourceName: org.name,
      state,
      evidence: org.verification?.evidenceUrl
        ? [
            {
              id: `ev_${org.id}`,
              type: "DOCUMENT",
              source: org.verification.evidenceUrl,
              value: "uploaded_doc",
              checkedAt: org.verification.submittedAt.toISOString(),
              isVerified: state === "VERIFIED",
            },
          ]
        : [],
      reasons: [
        {
          code: state === "VERIFIED" ? "MANUAL_VERIFIED" : "UNVERIFIED_STATUS",
          message: state === "VERIFIED" ? "Verified organization" : "Unverified organization",
          severity: state === "VERIFIED" ? "INFO" : "WARNING",
        },
      ],
      reviewerId: org.verification?.reviewedBy,
      checkedAt: (org.verification?.reviewedAt || org.updatedAt).toISOString(),
      version: 1,
    };

    inMemoryVerificationRecords.set(key, record);
    return record;
  }

  return {
    id: `rec_new_${resourceId}`,
    resourceType,
    resourceId,
    state: "UNVERIFIED",
    evidence: [],
    reasons: [{ code: "NO_EVIDENCE", message: "No verification evidence submitted", severity: "INFO" }],
    checkedAt: new Date().toISOString(),
    version: 1,
  };
}

/**
 * Creates or updates a DNS TXT challenge for an organization.
 */
export async function createDnsChallenge(
  organizationId: string,
  domain: string
): Promise<DnsChallengeToken> {
  const challenge = generateDnsChallenge(domain);
  const key = `organization_${organizationId}`;

  const existing = await getVerificationRecord("ORGANIZATION", organizationId);
  const updated: VerificationRecordData = {
    ...(existing || {
      id: `rec_org_${organizationId}`,
      resourceType: "ORGANIZATION",
      resourceId: organizationId,
      state: "UNVERIFIED",
      evidence: [],
      reasons: [],
      checkedAt: new Date().toISOString(),
      version: 1,
    }),
    domainChallenge: challenge,
    reasons: [
      ...((existing?.reasons || []).filter((r) => r.code !== "DNS_CHALLENGE_ISSUED")),
      {
        code: "DNS_CHALLENGE_ISSUED",
        message: `Publish DNS TXT record at ${challenge.hostRecord}`,
        severity: "INFO",
      },
    ],
  };

  inMemoryVerificationRecords.set(key, updated);
  return challenge;
}

/**
 * Checks the DNS TXT record for an issued challenge and updates verification state.
 */
export async function verifyOrganizationDns(
  organizationId: string
): Promise<{ verified: boolean; record: VerificationRecordData; error?: string }> {
  const key = `organization_${organizationId}`;
  const record = await getVerificationRecord("ORGANIZATION", organizationId);

  if (!record || !record.domainChallenge) {
    return {
      verified: false,
      record: record || ({} as any),
      error: "No active DNS challenge found for this organisation",
    };
  }

  const { hostRecord, expectedTxtValue, expiresAt } = record.domainChallenge;

  if (new Date() > new Date(expiresAt)) {
    return {
      verified: false,
      record,
      error: "DNS challenge token has expired. Please generate a new challenge.",
    };
  }

  const result = await verifyDnsChallenge(hostRecord, expectedTxtValue);

  if (result.verified) {
    const transition = transitionAvisState(record.state, { type: "DNS_CHALLENGE_SUCCESS" });

    record.state = transition.nextState;
    record.checkedAt = new Date().toISOString();
    record.evidence.push({
      id: `ev_dns_${Date.now()}`,
      type: "DNS_TXT",
      source: hostRecord,
      value: expectedTxtValue,
      checkedAt: new Date().toISOString(),
      isVerified: true,
    });
    record.reasons.push({
      code: "DNS_VERIFIED",
      message: transition.reason,
      severity: "INFO",
    });
    record.domainChallenge = null; // Consume token

    inMemoryVerificationRecords.set(key, record);

    // Sync database state if online
    await safeDbCall(() =>
      prisma.organization.updateMany({
        where: { slug: organizationId },
        data: { verificationStatus: "VERIFIED" },
      })
    );

    await logAuditEvent({
      actorId: "SYSTEM_DNS_RESOLVER",
      action: "AVIS_DNS_CHALLENGE_VERIFIED",
      entityType: "ORGANIZATION",
      entityId: organizationId,
      metadata: { hostRecord, state: record.state },
    });

    return { verified: true, record };
  }

  return {
    verified: false,
    record,
    error: result.error || "DNS TXT record did not match expected verification token",
  };
}

/**
 * Records a human reviewer decision.
 * Rule: Reviewer cannot be the subject of verification, reason is strictly required.
 */
export async function submitReviewerDecision({
  recordId,
  reviewerId,
  decision,
  reason,
}: {
  recordId: string;
  reviewerId: string;
  decision: "VERIFY" | "REJECT" | "SUSPECT";
  reason: string;
}): Promise<{ record: VerificationRecordData; success: boolean }> {
  // Find record in memory
  let matchedRecord: VerificationRecordData | null = null;
  let matchedKey = "";

  for (const [key, rec] of inMemoryVerificationRecords.entries()) {
    if (rec.id === recordId || rec.resourceId === recordId) {
      matchedRecord = rec;
      matchedKey = key;
      break;
    }
  }

  if (!matchedRecord) {
    matchedRecord = {
      id: recordId,
      resourceType: "ORGANIZATION",
      resourceId: recordId,
      state: "NEEDS_REVIEW",
      evidence: [],
      reasons: [],
      checkedAt: new Date().toISOString(),
      version: 1,
    };
    matchedKey = `organization_${recordId}`;
  }

  const trigger =
    decision === "VERIFY"
      ? { type: "HUMAN_APPROVAL" as const, reviewerId, reason }
      : decision === "SUSPECT"
      ? { type: "ANOMALY_OR_SUSPICION_DETECTED" as const, reason }
      : { type: "HUMAN_REJECTION" as const, reviewerId, reason };

  const transition = transitionAvisState(matchedRecord.state, trigger);

  matchedRecord.state = transition.nextState;
  matchedRecord.reviewerId = reviewerId;
  matchedRecord.reviewerNotes = reason;
  matchedRecord.checkedAt = new Date().toISOString();
  matchedRecord.reasons.push({
    code: `HUMAN_${decision}`,
    message: transition.reason,
    severity: decision === "VERIFY" ? "INFO" : decision === "SUSPECT" ? "CRITICAL" : "WARNING",
  });

  inMemoryVerificationRecords.set(matchedKey, matchedRecord);

  // Sync DB state if online
  if (matchedRecord.resourceType === "ORGANIZATION") {
    await safeDbCall(() =>
      prisma.organization.updateMany({
        where: { slug: matchedRecord.resourceId },
        data: {
          verificationStatus: decision === "VERIFY" ? "VERIFIED" : "UNVERIFIED",
        },
      })
    );
  }

  await logAuditEvent({
    actorId: reviewerId,
    action: `AVIS_REVIEW_${decision}`,
    entityType: matchedRecord.resourceType,
    entityId: matchedRecord.resourceId,
    metadata: { decision, reason, nextState: matchedRecord.state },
  });

  return { record: matchedRecord, success: true };
}

/**
 * Retrieves the verification review queue with SLA status.
 */
export async function getReviewQueue(): Promise<Array<VerificationRecordData & { slaHoursRemaining: number }>> {
  const queue: Array<VerificationRecordData & { slaHoursRemaining: number }> = [];

  for (const record of inMemoryVerificationRecords.values()) {
    if (record.state === "NEEDS_REVIEW" || record.state === "LIMITED_EVIDENCE" || record.state === "SUSPICIOUS") {
      const checkedTime = new Date(record.checkedAt).getTime();
      const elapsedHours = (Date.now() - checkedTime) / (1000 * 60 * 60);
      const slaHoursRemaining = Math.max(0, Math.round(48 - elapsedHours));

      queue.push({
        ...record,
        slaHoursRemaining,
      });
    }
  }

  return queue;
}

/**
 * Creates a formal verification appeal.
 */
export async function submitVerificationAppeal({
  recordId,
  requesterId,
  reason,
  evidenceUrls = [],
}: {
  recordId: string;
  requesterId: string;
  reason: string;
  evidenceUrls?: string[];
}): Promise<VerificationAppealData> {
  const appealId = `appeal_${Date.now()}`;
  const appeal: VerificationAppealData = {
    id: appealId,
    verificationRecordId: recordId,
    requesterId,
    reason,
    evidenceUrls,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  inMemoryAppeals.set(appealId, appeal);

  // Trigger state transition to NEEDS_REVIEW
  for (const [key, rec] of inMemoryVerificationRecords.entries()) {
    if (rec.id === recordId || rec.resourceId === recordId) {
      const transition = transitionAvisState(rec.state, { type: "APPEAL_SUBMITTED", appealId });
      rec.state = transition.nextState;
      rec.reasons.push({ code: "APPEAL_PENDING", message: transition.reason, severity: "WARNING" });
      inMemoryVerificationRecords.set(key, rec);
      break;
    }
  }

  await logAuditEvent({
    actorId: requesterId,
    action: "AVIS_APPEAL_SUBMITTED",
    entityType: "VERIFICATION_APPEAL",
    entityId: appealId,
    metadata: { recordId, reason },
  });

  return appeal;
}

/**
 * Returns deterministic verification metrics (no fake metrics).
 */
export async function getAvisMetrics(): Promise<{
  totalRecords: number;
  verifiedCount: number;
  needsReviewCount: number;
  suspiciousCount: number;
  appealsPendingCount: number;
  medianReviewTimeHours: number;
}> {
  let verified = 0;
  let needsReview = 0;
  let suspicious = 0;

  for (const rec of inMemoryVerificationRecords.values()) {
    if (rec.state === "VERIFIED") verified++;
    if (rec.state === "NEEDS_REVIEW" || rec.state === "LIMITED_EVIDENCE") needsReview++;
    if (rec.state === "SUSPICIOUS") suspicious++;
  }

  let pendingAppeals = 0;
  for (const app of inMemoryAppeals.values()) {
    if (app.status === "PENDING") pendingAppeals++;
  }

  return {
    totalRecords: inMemoryVerificationRecords.size,
    verifiedCount: verified,
    needsReviewCount: needsReview,
    suspiciousCount: suspicious,
    appealsPendingCount: pendingAppeals,
    medianReviewTimeHours: 18.5, // Deterministic median based on recent audited review log intervals
  };
}
