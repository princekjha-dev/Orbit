import { prisma } from "@/lib/db";

export type OrbitModNotificationType =
  | "SYSTEM"
  | "MATCH_OPPORTUNITY"
  | "TEAM_INVITATION"
  | "PROJECT_UPDATE"
  | "VERIFICATION_STATUS"
  | "SECURITY_ALERT";

export interface SendNotificationParams {
  userId: string;
  type: OrbitModNotificationType | string;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates and delivers a user notification.
 * Persists to database and safely degrades if DB is offline.
 */
export async function sendOrbitNotification({
  userId,
  type,
  title,
  body,
  link,
}: SendNotificationParams): Promise<{ id?: string; success: boolean }> {
  try {
    const notification = await Promise.race([
      prisma.notification.create({
        data: {
          userId,
          type: type as any,
          title,
          body,
          link: link || null,
          isRead: false,
        },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Notification DB timeout")), 250)
      ),
    ]);

    return { id: notification ? notification.id : undefined, success: true };
  } catch {
    // Graceful offline fallback
    return { success: false };
  }
}

export const createOrbitModNotification = sendOrbitNotification;
