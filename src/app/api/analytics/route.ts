import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/analytics - real data analytics only
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Talent Analytics (User's individual real data)
    const [
      talentApplications,
      talentProjects,
      talentVerifiedWork,
      talentOutcomeRecords,
      talentSkillEvidences,
      userOrgs,
    ] = await Promise.all([
      prisma.opportunityApplication.findMany({
        where: { userId: user.id },
        select: { id: true, status: true, appliedAt: true, updatedAt: true },
      }),
      prisma.projectApplication.findMany({
        where: { userId: user.id },
        select: { id: true, status: true, appliedAt: true },
      }),
      prisma.verifiedWorkRecord.findMany({
        where: { userId: user.id },
        select: { id: true, completionDate: true },
      }),
      prisma.outcomeRecord.findMany({
        where: { userId: user.id },
        select: { id: true, type: true, date: true },
      }),
      prisma.skillEvidence.findMany({
        where: { userId: user.id },
        select: { id: true, evidenceType: true },
      }),
      prisma.organizationMember.findMany({
        where: { userId: user.id },
        select: { organizationId: true, role: true },
      }),
    ]);

    const totalApplications = talentApplications.length;
    const interviewCount = talentApplications.filter(
      (a) => a.status === "INTERVIEW" || a.status === "SHORTLISTED"
    ).length;
    const selectedCount = talentApplications.filter((a) => a.status === "SELECTED").length;
    const completedWorkCount = talentVerifiedWork.length;
    const completedProjectsCount = talentProjects.filter((p) => p.status === "ACCEPTED").length;

    // 2. Organization Analytics (If user belongs to organizations)
    const orgIds = userOrgs.map((o) => o.organizationId);
    let orgAnalytics = null;

    if (orgIds.length > 0) {
      const [orgOpportunities, orgProjects, orgShortlists] = await Promise.all([
        prisma.opportunity.findMany({
          where: { organizationId: { in: orgIds }, isDeleted: false },
          include: {
            applications: {
              select: { id: true, status: true, appliedAt: true, updatedAt: true },
            },
          },
        }),
        prisma.project.findMany({
          where: { organizationId: { in: orgIds }, isDeleted: false },
          select: { id: true, status: true, health: true, createdAt: true },
        }),
        prisma.candidateShortlist.findMany({
          where: { organizationId: { in: orgIds } },
          include: {
            candidates: { select: { id: true, stage: true } },
          },
        }),
      ]);

      const totalOpportunities = orgOpportunities.length;
      const totalOrgApplications = orgOpportunities.reduce(
        (sum, opp) => sum + opp.applications.length,
        0
      );

      const totalShortlists = orgShortlists.length;
      const totalCandidatesTracked = orgShortlists.reduce(
        (sum, sl) => sum + sl.candidates.length,
        0
      );

      const totalOrgProjects = orgProjects.length;
      const completedOrgProjects = orgProjects.filter((p) => p.status === "COMPLETED").length;
      const completionRate =
        totalOrgProjects > 0
          ? `${Math.round((completedOrgProjects / totalOrgProjects) * 100)}%`
          : null;

      orgAnalytics = {
        totalOpportunities,
        totalOrgApplications,
        totalShortlists,
        totalCandidatesTracked,
        totalOrgProjects,
        completedOrgProjects,
        completionRate,
      };
    }

    return NextResponse.json({
      talent: {
        totalApplications,
        interviewCount,
        selectedCount,
        completedWorkCount,
        completedProjectsCount,
        totalEvidences: talentSkillEvidences.length,
        verifiedEvidenceCount: talentSkillEvidences.filter((e) => e.evidenceType === "VERIFIED").length,
      },
      organization: orgAnalytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
