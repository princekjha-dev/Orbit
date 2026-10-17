import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// POST /api/recruiter/candidates/[id]/notes - add internal note
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: shortlistCandidateId } = await params;
    const candidate = await prisma.shortlistCandidate.findUnique({
      where: { id: shortlistCandidateId },
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
    const { note } = body;

    if (!note || !note.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const createdNote = await prisma.candidateNote.create({
      data: {
        shortlistCandidateId,
        authorId: user.id,
        note: note.trim(),
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    // Update last activity on candidate
    await prisma.shortlistCandidate.update({
      where: { id: shortlistCandidateId },
      data: { lastActivity: new Date() },
    });

    return NextResponse.json({ note: createdNote }, { status: 201 });
  } catch (error) {
    console.error("Error creating candidate note:", error);
    return NextResponse.json(
      { error: "Failed to create candidate note" },
      { status: 500 }
    );
  }
}
