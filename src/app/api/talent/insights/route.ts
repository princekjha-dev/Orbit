import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

function buildSkillCounts(evidences: { skillName: string | null; isVerified: boolean }[]) {
  const skillCounts: Record<string, { count: number; verifiedCount: number; skill: string }> = {};
  for (const ev of evidences) {
    const s = (ev.skillName || "").trim();
    if (!s) continue;
    if (!skillCounts[s]) {
      skillCounts[s] = { count: 0, verifiedCount: 0, skill: s };
    }
    skillCounts[s].count += 1;
    if (ev.isVerified) {
      skillCounts[s].verifiedCount += 1;
    }
  }
  return skillCounts;
}

function buildGroundedStatements({
  topSkills,
  finishedProjectsCount,
  hackathonCount,
  mentorshipCount,
}: {
  topSkills: { count: number; verifiedCount: number; skill: string }[];
  finishedProjectsCount: number;
  hackathonCount: number;
  mentorshipCount: number;
}): string[] {
  const statements: string[] = [];

  for (const s of topSkills) {
    if (s.verifiedCount > 0) {
      statements.push(
        `Demonstrated verified ${s.skill} proficiency across ${s.verifiedCount} verified evidence record${
          s.verifiedCount === 1 ? "" : "s"
        }.`
      );
    } else {
      statements.push(
        `Demonstrated ${s.skill} skills across ${s.count} recorded project artifact${
          s.count === 1 ? "" : "s"
        }.`
      );
    }
  }

  if (finishedProjectsCount > 0) {
    statements.push(
      `Completed work on ${finishedProjectsCount} organization project${
        finishedProjectsCount === 1 ? "" : "s"
      }.`
    );
  }

  if (hackathonCount > 0) {
    statements.push(
      `Participated in ${hackathonCount} hackathon competition${
        hackathonCount === 1 ? "" : "s"
      }.`
    );
  }

  if (mentorshipCount > 0) {
    statements.push(
      `Completed ${mentorshipCount} active mentorship session${
        mentorshipCount === 1 ? "" : "s"
      }.`
    );
  }

  return statements;
}

function buildTrustCategories({
  identityVerification,
  topSkills,
  finishedProjectsCount,
  verifiedWorkCount,
  portableCredentialsCount,
  hackathonsCount,
  mentorshipCount,
}: {
  identityVerification: any;
  topSkills: { count: number; verifiedCount: number; skill: string }[];
  finishedProjectsCount: number;
  verifiedWorkCount: number;
  portableCredentialsCount: number;
  hackathonsCount: number;
  mentorshipCount: number;
}) {
  return [
    {
      category: "Verified Identity",
      status: identityVerification?.status === "VERIFIED" ? "VERIFIED" : identityVerification?.status === "PENDING" ? "PENDING" : "UNVERIFIED",
      detail: identityVerification?.status === "VERIFIED" ? "Government credential verified by Orbit administration." : "Identity verification not yet completed.",
    },
    {
      category: "Verified Skills",
      status: topSkills.some((s) => s.verifiedCount > 0) ? "ACTIVE" : "PENDING",
      detail: `${topSkills.filter((s) => s.verifiedCount > 0).length} skills backed by verified deliverables.`,
    },
    {
      category: "Completed Projects",
      status: finishedProjectsCount > 0 ? "ACTIVE" : "INACTIVE",
      detail: `${finishedProjectsCount} projects completed in accepted roles.`,
    },
    {
      category: "Organization Reviews",
      status: verifiedWorkCount > 0 ? "ACTIVE" : "INACTIVE",
      detail: `${verifiedWorkCount} verified work records certified by organizations.`,
    },
    {
      category: "Public Artifacts",
      status: portableCredentialsCount > 0 ? "ACTIVE" : "INACTIVE",
      detail: `${portableCredentialsCount} cryptographically signed portable credentials published.`,
    },
    {
      category: "Hackathon Participation",
      status: hackathonsCount > 0 ? "ACTIVE" : "INACTIVE",
      detail: `${hackathonsCount} hackathon teams joined.`,
    },
    {
      category: "Mentorship Activity",
      status: mentorshipCount > 0 ? "ACTIVE" : "INACTIVE",
      detail: `${mentorshipCount} completed mentorship sessions.`,
    },
  ];
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      identityVerification,
      skillEvidences,
      completedProjects,
      verifiedWorkRecords,
      hackathonMemberships,
      mentorshipSessions,
      opportunityApps,
      portableCredentials,
      careerGoals,
    ] = await Promise.all([
      prisma.identityVerification.findUnique({
        where: { userId: user.id },
      }),
      prisma.skillEvidence.findMany({
        where: { userId: user.id },
      }),
      prisma.projectApplication.findMany({
        where: { userId: user.id, status: "ACCEPTED" },
        include: {
          project: {
            select: { id: true, title: true, status: true, organization: { select: { name: true } } },
          },
        },
      }),
      prisma.verifiedWorkRecord.findMany({
        where: { userId: user.id },
      }),
      prisma.hackathonMember.findMany({
        where: { userId: user.id },
        include: { team: true },
      }),
      prisma.mentorshipSession.findMany({
        where: {
          OR: [{ mentorId: user.id }, { menteeId: user.id }],
          status: "COMPLETED",
        },
      }),
      prisma.opportunityApplication.findMany({
        where: { userId: user.id },
        include: { opportunity: { select: { title: true, type: true } } },
      }),
      prisma.portableEvidenceCredential.findMany({
        where: { userId: user.id, isRevoked: false },
      }),
      prisma.careerGoal.findMany({
        where: { userId: user.id },
      }),
    ]);

    const skillCounts = buildSkillCounts(skillEvidences);
    const topSkills = Object.values(skillCounts).filter((s) => s.count > 0);
    const finishedProjects = completedProjects.filter((p) => p.project.status === "COMPLETED");

    const statements = buildGroundedStatements({
      topSkills,
      finishedProjectsCount: finishedProjects.length,
      hackathonCount: hackathonMemberships.length,
      mentorshipCount: mentorshipSessions.length,
    });

    const trustCategories = buildTrustCategories({
      identityVerification,
      topSkills,
      finishedProjectsCount: finishedProjects.length,
      verifiedWorkCount: verifiedWorkRecords.length,
      portableCredentialsCount: portableCredentials.length,
      hackathonsCount: hackathonMemberships.length,
      mentorshipCount: mentorshipSessions.length,
    });

    return NextResponse.json({
      trustCategories,
      dataBackedStatements: statements,
      metrics: {
        completedProjectsCount: finishedProjects.length,
        skillsCount: Object.keys(skillCounts).length,
        opportunitiesPursuedCount: opportunityApps.length,
        verifiedWorkCount: verifiedWorkRecords.length,
        hackathonsCount: hackathonMemberships.length,
        mentorshipSessionsCount: mentorshipSessions.length,
        portableCredentialsCount: portableCredentials.length,
        activeGoalsCount: careerGoals.filter((g) => g.isActive).length,
      },
    });
  } catch (error) {
    console.error("GET /api/talent/insights error:", error);
    return NextResponse.json({ error: "Failed to fetch talent insights" }, { status: 500 });
  }
}
