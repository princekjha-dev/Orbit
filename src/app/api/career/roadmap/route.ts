import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// Standard evidence targets for career paths
const CAREER_PATH_REQUIREMENTS: Record<
  string,
  {
    coreSkills: string[];
    recommendedMilestones: string[];
    suggestedProjectTypes: string[];
  }
> = {
  "Frontend Engineer": {
    coreSkills: ["React", "TypeScript", "Next.js", "CSS", "Testing"],
    recommendedMilestones: [
      "Ship a production web application with verified deployment artifact",
      "Demonstrate end-to-end type safety with TypeScript in a completed project",
      "Participate in a frontend or hackathon challenge",
      "Apply to junior to mid-level frontend roles with public portfolio evidence",
    ],
    suggestedProjectTypes: ["PAID_PROJECT", "JOB"],
  },
  "Product Designer": {
    coreSkills: ["UI Design", "Figma", "User Research", "Design Systems", "Prototyping"],
    recommendedMilestones: [
      "Publish a comprehensive design system case study with interactive prototype",
      "Complete a scoped UX/UI redesign with verified user feedback",
      "Contribute design assets to an active open-source or startup project",
    ],
    suggestedProjectTypes: ["PAID_PROJECT", "STARTUP_ROLE"],
  },
  "AI Engineer": {
    coreSkills: ["Python", "PyTorch", "LLM Integration", "FastAPI", "Vector Databases"],
    recommendedMilestones: [
      "Deploy an end-to-end AI/ML application with real inference API",
      "Complete a verified project incorporating RAG or fine-tuning",
      "Participate in an AI hackathon with public repository evidence",
    ],
    suggestedProjectTypes: ["PAID_PROJECT", "JOB"],
  },
  "Founder": {
    coreSkills: ["Product Strategy", "Go-To-Market", "Customer Discovery", "Hiring", "Financial Modeling"],
    recommendedMilestones: [
      "Launch an MVP on Orbit Startup Workspace with documented validation milestones",
      "Build a founding team via the Collaboration Market",
      "Publish open structured hiring needs for early technical contributors",
    ],
    suggestedProjectTypes: ["STARTUP_ROLE"],
  },
  "Data Analyst": {
    coreSkills: ["SQL", "Python", "Data Visualization", "Statistical Analysis", "Tableau"],
    recommendedMilestones: [
      "Publish an end-to-end data pipeline and visualization report",
      "Complete a business analytics project with verified organization review",
      "Contribute empirical data insights to an open research initiative",
    ],
    suggestedProjectTypes: ["PAID_PROJECT", "INTERNSHIP"],
  },
};

// GET /api/career/roadmap - compute career roadmap based on real user evidence
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const selectedRole = searchParams.get("targetRole") || "Frontend Engineer";

    // 1. Get user profile skills and verified work records
    const [profile, verifiedWork, skillEvidences, userGoal] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: user.id },
        include: { skills: { include: { skill: true } } },
      }),
      prisma.verifiedWorkRecord.findMany({
        where: { userId: user.id },
        select: { id: true, projectTitle: true, orgName: true },
      }),
      prisma.skillEvidence.findMany({
        where: { userId: user.id },
        select: { skillName: true, evidenceType: true, proofType: true },
      }),
      prisma.careerGoal.findFirst({
        where: { userId: user.id, isActive: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const activeRole = userGoal?.targetRole || selectedRole;
    const pathConfig = CAREER_PATH_REQUIREMENTS[activeRole] || CAREER_PATH_REQUIREMENTS["Frontend Engineer"];

    const userSkillNames = (profile?.skills || []).map((s) => s.skill.name.toLowerCase());
    const verifiedSkillNames = skillEvidences
      .filter((e) => e.evidenceType === "VERIFIED" || e.evidenceType === "EXTERNAL")
      .map((e) => e.skillName.toLowerCase());

    // Compute present skills and missing skills
    const currentEvidenceSkills = pathConfig.coreSkills.filter((reqSkill) =>
      verifiedSkillNames.includes(reqSkill.toLowerCase()) || userSkillNames.includes(reqSkill.toLowerCase())
    );

    const missingEvidenceSkills = pathConfig.coreSkills.filter(
      (reqSkill) => !currentEvidenceSkills.includes(reqSkill)
    );

    // Find relevant real Orbit opportunities matching missing skills or active role
    const matchingOpportunities = await prisma.opportunity.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        type: true,
        organization: { select: { name: true } },
        skills: { select: { skill: { select: { name: true } } } },
      },
      take: 4,
    });

    return NextResponse.json({
      targetRole: activeRole,
      availableRoles: Object.keys(CAREER_PATH_REQUIREMENTS),
      currentEvidenceSkills,
      missingEvidenceSkills,
      recommendedMilestones: pathConfig.recommendedMilestones,
      matchingOpportunities: matchingOpportunities.map((opp) => ({
        id: opp.id,
        title: opp.title,
        type: opp.type,
        orgName: opp.organization.name,
        skills: opp.skills.map((s) => s.skill.name),
      })),
      verifiedProjectsCount: verifiedWork.length,
      totalEvidenceCount: skillEvidences.length,
    });
  } catch (error) {
    console.error("Error computing career roadmap:", error);
    return NextResponse.json(
      { error: "Failed to compute career roadmap" },
      { status: 500 }
    );
  }
}

// POST /api/career/roadmap - save target role
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetRole } = body;

    if (!targetRole) {
      return NextResponse.json({ error: "targetRole is required" }, { status: 400 });
    }

    const goal = await prisma.careerGoal.create({
      data: {
        userId: user.id,
        targetRole,
        isActive: true,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error saving career goal:", error);
    return NextResponse.json(
      { error: "Failed to save career goal" },
      { status: 500 }
    );
  }
}
