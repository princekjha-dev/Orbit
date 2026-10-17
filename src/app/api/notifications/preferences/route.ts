import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preference = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  return NextResponse.json({ preference });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const preference = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
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
      userId: session.user.id,
      ...body,
    },
  });

  return NextResponse.json({ preference });
}
