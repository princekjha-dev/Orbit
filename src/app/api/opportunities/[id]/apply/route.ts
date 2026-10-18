import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore, StoredApplication } from "@/lib/database/in-memory-store";
import { sendOrbitNotification } from "@/lib/notifications/orbitmod-notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // 1. Authentication Check
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to apply for this opportunity." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { coverLetter, portfolioUrl, resumeUrl, resumeName } = body;

    // 2. Profile Check
    const dbUser = await safeDbCall(
      () =>
        prisma.user.findUnique({
          where: { id: user.id! },
          include: { profile: true },
        }),
      null
    );

    const userName = dbUser?.name || user.name || "";
    const userEmail = dbUser?.email || user.email || "";

    if (!userName.trim() || !userEmail.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROFILE_INCOMPLETE",
            message: "Complete your profile (name and email) before applying.",
            missingFields: [!userName ? "Name" : "", !userEmail ? "Email" : ""].filter(Boolean),
          },
        },
        { status: 400 }
      );
    }

    // 3. Opportunity Check
    const opportunity = await safeDbCall(
      () =>
        prisma.opportunity.findUnique({
          where: { id, isDeleted: false },
          include: {
            organization: {
              include: {
                members: {
                  where: { role: { in: ["OWNER", "ADMIN"] } },
                  select: { userId: true },
                },
              },
            },
          },
        }),
      null
    );

    if (opportunity) {
      if (!opportunity.isActive) {
        return NextResponse.json(
          { success: false, error: { code: "OPPORTUNITY_CLOSED", message: "This opportunity is closed and no longer accepting applications." } },
          { status: 400 }
        );
      }
      if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) {
        return NextResponse.json(
          { success: false, error: { code: "DEADLINE_PASSED", message: "The application deadline for this position has passed." } },
          { status: 400 }
        );
      }
    }

    // 4. Duplicate Application Prevention
    const existingKey = `${id}:${user.id}`;
    if (inMemoryStore.applications.has(existingKey)) {
      const existing = inMemoryStore.applications.get(existingKey);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_APPLIED",
            message: "You have already applied for this opportunity.",
            existingStatus: existing?.status || "APPLIED",
            applicationId: existing?.id,
          },
        },
        { status: 409 }
      );
    }

    const existingDb = await safeDbCall(
      () =>
        prisma.opportunityApplication.findUnique({
          where: { opportunityId_userId: { opportunityId: id, userId: user.id! } },
        }),
      null
    );

    if (existingDb) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_APPLIED",
            message: "You have already applied for this opportunity.",
            existingStatus: existingDb.status,
            applicationId: existingDb.id,
          },
        },
        { status: 409 }
      );
    }

    // 5. Persist Application
    const newAppId = `app-${Date.now()}`;
    const selectedResume = resumeUrl || dbUser?.profile?.resumeUrl || null;
    const appliedTimestamp = new Date().toISOString();

    const storedApp: StoredApplication = {
      id: newAppId,
      opportunityId: id,
      userId: user.id!,
      coverLetter: coverLetter || "",
      portfolioUrl: portfolioUrl || null,
      status: "APPLIED",
      createdAt: appliedTimestamp,
      updatedAt: appliedTimestamp,
    };
    (storedApp as any).resumeUrl = selectedResume;
    (storedApp as any).resumeName = resumeName || "Resume Document";

    inMemoryStore.applications.set(existingKey, storedApp);

    // Save in Prisma DB
    await safeDbCall(() =>
      prisma.opportunityApplication.create({
        data: {
          id: newAppId,
          opportunityId: id,
          userId: user.id!,
          coverLetter: coverLetter || null,
          portfolioUrl: portfolioUrl || null,
          resumeUrl: selectedResume,
          status: "APPLIED",
        },
      })
    );

    // 6. Application Activity & Notifications
    const oppTitle = opportunity?.title || "Technical Opportunity";
    const orgName = opportunity?.organization?.name || "Verified Organization";

    // A. Notification for Applicant
    await sendOrbitNotification({
      userId: user.id,
      type: "MATCH_OPPORTUNITY",
      title: "Application Submitted",
      body: `Your application to ${oppTitle} at ${orgName} has been received.`,
      link: `/opportunities/${id}`,
    });

    // B. Notification for Recruiter / Org Admins
    if (opportunity?.organization?.members) {
      for (const member of opportunity.organization.members) {
        if (member.userId !== user.id) {
          await sendOrbitNotification({
            userId: member.userId,
            type: "MATCH_OPPORTUNITY",
            title: "New Application Received",
            body: `${userName} applied for ${oppTitle}.`,
            link: `/opportunities/${id}/applications`,
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newAppId,
          status: "APPLIED",
          opportunityId: id,
          opportunityTitle: oppTitle,
          organizationName: orgName,
          resumeUsed: resumeName || (selectedResume ? "Attached Resume" : "Profile Evidence"),
          appliedAt: appliedTimestamp,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[apply opportunity]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error?.message || "Internal server error" } },
      { status: 500 }
    );
  }
}
