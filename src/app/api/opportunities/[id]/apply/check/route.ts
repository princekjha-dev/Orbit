import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({
        success: true,
        data: {
          isAuthenticated: false,
          user: null,
          isProfileComplete: false,
          missingFields: ["Authentication required"],
          hasApplied: false,
          isOpen: true,
        },
      });
    }

    // 1. Fetch user & profile
    const dbUser = await safeDbCall(
      () =>
        prisma.user.findUnique({
          where: { id: user.id! },
          include: {
            profile: {
              include: { skills: { include: { skill: true } } },
            },
          },
        }),
      null
    );

    const userName = dbUser?.name || user.name || "";
    const userEmail = dbUser?.email || user.email || "";
    const headline = dbUser?.profile?.headline || "";
    let resumeUrl = dbUser?.profile?.resumeUrl || null;
    let resumeName: string | null = null;

    // Check in-memory profile if DB profile resume is null
    const memoryProfile = inMemoryStore.userProfiles.get(user.id);
    if (!resumeUrl && memoryProfile?.resumeUrl) {
      resumeUrl = memoryProfile.resumeUrl;
      resumeName = memoryProfile.resumeName || "Uploaded Resume";
    }

    const missingFields: string[] = [];
    if (!userName.trim()) missingFields.push("Name");
    if (!userEmail.trim()) missingFields.push("Email");

    const isProfileComplete = missingFields.length === 0;

    // 2. Check if already applied
    let hasApplied = false;
    let existingApp: any = null;

    // Check in-memory store
    const existingKey = `${id}:${user.id}`;
    if (inMemoryStore.applications.has(existingKey)) {
      hasApplied = true;
      existingApp = inMemoryStore.applications.get(existingKey);
    }

    // Check DB
    if (!hasApplied) {
      const dbApp = await safeDbCall(
        () =>
          prisma.opportunityApplication.findFirst({
            where: { opportunityId: id, userId: user.id! },
            select: { id: true, status: true, appliedAt: true, resumeUrl: true },
          }),
        null
      );
      if (dbApp) {
        hasApplied = true;
        existingApp = dbApp;
        if (!resumeUrl && dbApp.resumeUrl) {
          resumeUrl = dbApp.resumeUrl;
        }
      }
    }

    // 3. Check opportunity status
    const opp = await safeDbCall(
      () =>
        prisma.opportunity.findUnique({
          where: { id, isDeleted: false },
          include: { organization: { select: { name: true, slug: true } } },
        }),
      null
    );

    const isOpen = opp ? opp.isActive && (!opp.deadline || new Date(opp.deadline) >= new Date()) : true;

    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: true,
        user: {
          id: user.id,
          name: userName,
          email: userEmail,
          headline,
        },
        isProfileComplete,
        missingFields,
        hasApplied,
        existingApplication: existingApp,
        existingResumeUrl: resumeUrl,
        existingResumeName: resumeName || (resumeUrl ? "Existing Resume Document" : null),
        isOpen,
        opportunityTitle: opp?.title || "Opportunity",
        organizationName: opp?.organization?.name || "Organization",
      },
    });
  } catch (err: any) {
    console.error("[apply check error]", err);
    return NextResponse.json(
      { success: false, error: { code: "CHECK_ERROR", message: err?.message || "Failed to check application status" } },
      { status: 500 }
    );
  }
}
