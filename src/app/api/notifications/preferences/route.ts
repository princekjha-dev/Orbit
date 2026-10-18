import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const preference = await safeDbCall(
    () =>
      prisma.notificationPreference.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      }),
    {
      userId: user.id,
      emailNotifications: true,
      inAppNotifications: true,
      eventReminders: true,
      applicationUpdates: true,
      messageAlerts: true,
      communityActivity: true,
      mentorshipAlerts: true,
    } as any
  );

  return NextResponse.json({ success: true, preference });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();

  const preference = await safeDbCall(
    () =>
      prisma.notificationPreference.upsert({
        where: { userId: user.id },
        update: {
          emailNotifications: typeof body.emailNotifications === "boolean" ? body.emailNotifications : undefined,
          inAppNotifications: typeof body.inAppNotifications === "boolean" ? body.inAppNotifications : undefined,
          eventReminders: typeof body.eventReminders === "boolean" ? body.eventReminders : undefined,
          applicationUpdates: typeof body.applicationUpdates === "boolean" ? body.applicationUpdates : undefined,
          messageAlerts: typeof body.messageAlerts === "boolean" ? body.messageAlerts : undefined,
          communityActivity: typeof body.communityActivity === "boolean" ? body.communityActivity : undefined,
          mentorshipAlerts: typeof body.mentorshipAlerts === "boolean" ? body.mentorshipAlerts : undefined,
        },
        create: {
          userId: user.id,
          ...body,
        },
      }),
    { userId: user.id, ...body }
  );

  return NextResponse.json({ success: true, preference });
}
