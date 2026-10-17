import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { RecruiterStage } from "@prisma/client";

// PATCH /api/recruiter/candidates/[id]/stage - update candidate pipeline stage
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const candidate = await prisma.shortlistCandidate.findUnique({
      where: { id },
      include: { shortlist: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    // Verify organization membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: candidate.shortlist.organizationId,
          userId: user.id,
        },
      },
    });

    if (!membership && (user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { stage } = body;

    if (!stage || !Object.values(RecruiterStage).includes(stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const updated = await prisma.shortlistCandidate.update({
      where: { id },
      data: {
        stage: stage as RecruiterStage,
        lastActivity: new Date(),
      },
    });

    return NextResponse.json({ candidate: updated });
  } catch (error) {
    console.error("Error updating candidate stage:", error);
    return NextResponse.json(
      { error: "Failed to update candidate stage" },
      { status: 500 }
    );
  }
}
