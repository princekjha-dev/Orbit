import { prisma } from "@/lib/db";

export interface AuditLogParams {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Sanitizes metadata to ensure private message content, PII,
 * authentication tokens, and secret keys are NEVER written to audit logs.
 */
function sanitizeAuditMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
  if (!metadata) return undefined;

  const forbiddenKeys = [
    "password",
    "token",
    "secret",
    "authToken",
    "content",
    "messageBody",
    "privateText",
    "apiKey",
    "authorization",
  ];

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    const keyLower = key.toLowerCase();
    if (forbiddenKeys.some((f) => keyLower.includes(f))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeAuditMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Persists an immutable audit log record.
 * Fails gracefully without throwing to prevent breaking critical user workflows.
 */
export async function logAuditEvent({
  actorId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
}: AuditLogParams): Promise<boolean> {
  try {
    const cleanMetadata = sanitizeAuditMetadata(metadata);

    const result = await Promise.race([
      prisma.auditLog.create({
        data: {
          actorId,
          action,
          entityType,
          entityId,
          metadata: cleanMetadata ? (cleanMetadata as any) : undefined,
          ipAddress: ipAddress || null,
        },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Audit log DB timeout")), 250)
      ),
    ]);
    return !!result;
  } catch {
    // Audit logging failure must never crash the primary user workflow
    return false;
  }
}
