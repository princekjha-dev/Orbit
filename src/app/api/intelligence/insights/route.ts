import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/intelligence/insights - deterministic, explainable insights & recommendations
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [
      profile,
      skillEvidences,
      userApplications,
      activeProjects,
      savedOpportunities,
      openOpportunities,
    ] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: user.id },
        include: { skills: { include: { skill: true } } },
      }),
      prisma.skillEvidence.findMany({
        where: { userId: user.id },
        select: { skillName: true, evidenceType: true },
      }),
      prisma.opportunityApplication.findMany({
        where: { userId: user.id },
        include: { opportunity: { select: { title: true, deadline: true } } },
        orderBy: { appliedAt: "desc" },
        take: 10,
      }),
      prisma.projectApplication.findMany({
        where: { userId: user.id, status: "ACCEPTED" },
        include: {
          project: {
            select: { id: true, title: true, deadline: true, health: true },
          },
        },
      }),
      prisma.savedOpportunity.findMany({
        where: { userId: user.id },
        include: { opportunity: { select: { id: true, title: true, deadline: true } } },
      }),
      prisma.opportunity.findMany({
        where: { isActive: true, isDeleted: false },
        include: {
          organization: { select: { name: true } },
          skills: { include: { skill: true } },
        },
        take: 20,
      }),
    ]);

    const insights: {
      id: string;
      type: "DEADLINE" | "EVIDENCE_GAP" | "MATCH" | "ACTION_REQUIRED";
      title: string;
      message: string;
      link?: string;
      actionLabel?: string;
    }[] = [];

    // Rule 1: Project Deadline Approaching
    for (const pa of activeProjects) {
      if (pa.project.deadline) {
        const deadline = new Date(pa.project.deadline);
        if (deadline > now && deadline <= threeDaysLater) {
          insights.push({
            id: `proj-deadline-${pa.project.id}`,
            type: "DEADLINE",
            title: "Project Milestone Approaching",
            message: `Your accepted project "${pa.project.title}" has a deadline on ${deadline.toLocaleDateString()}. Status is ${pa.project.health.replace(/_/g, " ")}.`,
            link: `/projects/${pa.project.id}`,
            actionLabel: "View Project",
          });
        }
      }
    }

    // Rule 2: Claimed skills without verified evidence
    const claimedSkills = (profile?.skills || []).map((s) => s.skill.name);
    const verifiedSkills = skillEvidences
      .filter((e) => e.evidenceType === "VERIFIED" || e.evidenceType === "EXTERNAL")
      .map((e) => e.skillName.toLowerCase());

    const skillsWithoutEvidence = claimedSkills.filter(
      (s) => !verifiedSkills.includes(s.toLowerCase())
    );

    if (skillsWithoutEvidence.length > 0) {
      const topGap = skillsWithoutEvidence[0];
      insights.push({
        id: `gap-${topGap}`,
        type: "EVIDENCE_GAP",
        title: `No Evidence Logged for ${topGap}`,
        message: `You listed ${topGap} on your profile, but have not attached a public repository, project artifact, or verified completion. Adding evidence increases recruiter discovery.`,
        link: "/profile",
        actionLabel: "Add Evidence",
      });
    }

    // Rule 3: Saved opportunity expiring without application
    for (const saved of savedOpportunities) {
      const alreadyApplied = userApplications.some(
        (a) => a.opportunityId === saved.opportunityId
      );
      if (!alreadyApplied && saved.opportunity.deadline) {
        const deadline = new Date(saved.opportunity.deadline);
        if (deadline > now && deadline <= threeDaysLater) {
          insights.push({
            id: `saved-expiring-${saved.opportunity.id}`,
            type: "DEADLINE",
            title: "Saved Opportunity Closing Soon",
            message: `"${saved.opportunity.title}" deadline closes in less than 3 days.`,
            link: `/opportunities/${saved.opportunity.id}`,
            actionLabel: "Complete Application",
          });
        }
      }
    }

    // Rule 4: Explainable Opportunity Recommendations
    const userAllSkills = claimedSkills.map((s) => s.toLowerCase());
    const explainableRecommendations: {
      opportunityId: string;
      title: string;
      organizationName: string;
      reason: string;
      matchingSkills: string[];
    }[] = [];

    for (const opp of openOpportunities) {
      const oppSkills = opp.skills.map((s) => s.skill.name);
      const matched = oppSkills.filter((s) => userAllSkills.includes(s.toLowerCase()));
      if (matched.length > 0) {
        explainableRecommendations.push({
          opportunityId: opp.id,
          title: opp.title,
          organizationName: opp.organization.name,
          matchingSkills: matched,
          reason: `Recommended because it matches your demonstrated ${matched.join(" and ")} experience.`,
        });
      }
      if (explainableRecommendations.length >= 4) break;
    }

    return NextResponse.json({
      insights,
      recommendations: explainableRecommendations,
    });
  } catch (error) {
    console.error("Error generating intelligence insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
