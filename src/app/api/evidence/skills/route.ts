import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { EvidenceType, SkillProofType } from "@prisma/client";

// GET /api/evidence/skills - get current user's skill evidence grouped by skill
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId") || user.id;

    // Fetch all skill evidence for the user
    const evidences = await prisma.skillEvidence.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
    });

    // Also get verified work records to compute verified projects counts
    const verifiedWork = await prisma.verifiedWorkRecord.findMany({
      where: { userId: targetUserId },
      select: { id: true, projectTitle: true, orgName: true, scope: true, completionDate: true },
    });

    // Group evidences by skillName
    const skillsMap: Record<
      string,
      {
        skillName: string;
        claimedCount: number;
        verifiedCount: number;
        externalCount: number;
        items: typeof evidences;
      }
    > = {};

    for (const item of evidences) {
      if (!skillsMap[item.skillName]) {
        skillsMap[item.skillName] = {
          skillName: item.skillName,
          claimedCount: 0,
          verifiedCount: 0,
          externalCount: 0,
          items: [],
        };
      }
      skillsMap[item.skillName].items.push(item);
      if (item.evidenceType === EvidenceType.VERIFIED) {
        skillsMap[item.skillName].verifiedCount++;
      } else if (item.evidenceType === EvidenceType.EXTERNAL) {
        skillsMap[item.skillName].externalCount++;
      } else {
        skillsMap[item.skillName].claimedCount++;
      }
    }

    return NextResponse.json({
      skills: Object.values(skillsMap),
      verifiedWorkCount: verifiedWork.length,
      totalEvidences: evidences.length,
    });
  } catch (error) {
    console.error("Error fetching skill evidence:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill evidence" },
      { status: 500 }
    );
  }
}

// POST /api/evidence/skills - add skill evidence item
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { skillName, proofType, title, context, url, referenceId } = body;

    if (!skillName || !proofType || !title) {
      return NextResponse.json(
        { error: "skillName, proofType, and title are required" },
        { status: 400 }
      );
    }

    // Determine evidenceType based on proofType
    let evidenceType: EvidenceType = EvidenceType.CLAIMED;
    let isVerified = false;
    let verifiedBy: string | null = null;
    let verifiedAt: Date | null = null;

    if (
      proofType === SkillProofType.VERIFIED_PROJECT ||
      proofType === SkillProofType.VERIFIED_WORK ||
      proofType === SkillProofType.ORGANIZATION_REVIEW
    ) {
      // Check if reference exists in verified work records
      if (referenceId) {
        const record = await prisma.verifiedWorkRecord.findUnique({
          where: { id: referenceId },
        });
        if (record && record.userId === user.id) {
          evidenceType = EvidenceType.VERIFIED;
          isVerified = true;
          verifiedBy = record.orgName;
          verifiedAt = record.completionDate;
        }
      }
    } else if (
      proofType === SkillProofType.GITHUB_REPO ||
      proofType === SkillProofType.PORTFOLIO_ARTIFACT ||
      proofType === SkillProofType.CERTIFICATION
    ) {
      evidenceType = EvidenceType.EXTERNAL;
    }

    const created = await prisma.skillEvidence.create({
      data: {
        userId: user.id,
        skillName: skillName.trim(),
        evidenceType,
        proofType,
        title: title.trim(),
        context: context ? context.trim() : null,
        url: url ? url.trim() : null,
        referenceId: referenceId || null,
        isVerified,
        verifiedAt,
        verifiedBy,
      },
    });

    return NextResponse.json({ evidence: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating skill evidence:", error);
    return NextResponse.json(
      { error: "Failed to create skill evidence" },
      { status: 500 }
    );
  }
}
