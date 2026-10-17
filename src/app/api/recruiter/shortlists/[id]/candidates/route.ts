import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { RecruiterStage } from "@prisma/client";

// POST /api/recruiter/shortlists/[id]/candidates - add candidate to shortlist
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: shortlistId } = await params;
    const shortlist = await prisma.candidateShortlist.findUnique({
      where: { id: shortlistId },
    });

    if (!shortlist) {
      return NextResponse.json({ error: "Shortlist not found" }, { status: 404 });
    }

    // Verify organization membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: shortlist.organizationId,
          userId: user.id,
        },
      },
    });

    if (!membership && (user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { candidateId, stage = "DISCOVERED", relevantSkills, matchReason } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId is required" },
        { status: 400 }
      );
    }

    // Upsert candidate in shortlist
    const candidate = await prisma.shortlistCandidate.upsert({
      where: {
        shortlistId_candidateId: {
          shortlistId,
          candidateId,
        },
      },
      update: {
        stage: stage as RecruiterStage,
        relevantSkills: relevantSkills ? String(relevantSkills) : undefined,
        matchReason: matchReason ? String(matchReason) : undefined,
        lastActivity: new Date(),
      },
      create: {
        shortlistId,
        candidateId,
        stage: stage as RecruiterStage,
        relevantSkills: relevantSkills ? String(relevantSkills) : null,
        matchReason: matchReason ? String(matchReason) : null,
      },
    });

    return NextResponse.json({ candidate }, { status: 201 });
  } catch (error) {
    console.error("Error adding candidate to shortlist:", error);
    return NextResponse.json(
      { error: "Failed to add candidate to shortlist" },
      { status: 500 }
    );
  }
}
