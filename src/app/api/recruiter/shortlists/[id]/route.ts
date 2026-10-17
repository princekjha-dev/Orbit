import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/recruiter/shortlists/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const shortlist = await prisma.candidateShortlist.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        candidates: {
          include: {
            notes: {
              include: {
                author: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { lastActivity: "desc" },
        },
      },
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
      return NextResponse.json(
        { error: "Forbidden: You cannot view another organization's shortlist" },
        { status: 403 }
      );
    }

    // Enrich candidate user details
    const candidateUserIds = shortlist.candidates.map((c) => c.candidateId);
    const candidateUsers = await prisma.user.findMany({
      where: { id: { in: candidateUserIds } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        profile: {
          select: {
            headline: true,
            location: true,
            skills: { select: { skill: { select: { name: true } } } },
          },
        },
        verifiedWorkRecords: {
          select: { id: true, projectTitle: true, orgName: true },
        },
      },
    });

    const userMap = new Map(candidateUsers.map((u) => [u.id, u]));

    const enrichedCandidates = shortlist.candidates.map((c) => {
      const u = userMap.get(c.candidateId);
      return {
        ...c,
        user: u
          ? {
              id: u.id,
              name: u.name,
              username: u.username,
              image: u.image,
              headline: u.profile?.headline || null,
              location: u.profile?.location || null,
              skills: (u.profile?.skills || []).map((s) => s.skill.name),
              verifiedCount: u.verifiedWorkRecords.length,
            }
          : null,
      };
    });

    return NextResponse.json({
      shortlist: {
        ...shortlist,
        candidates: enrichedCandidates,
      },
    });
  } catch (error) {
    console.error("Error fetching shortlist detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch shortlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/recruiter/shortlists/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const shortlist = await prisma.candidateShortlist.findUnique({
      where: { id },
    });

    if (!shortlist) {
      return NextResponse.json({ error: "Shortlist not found" }, { status: 404 });
    }

    // Verify membership
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

    await prisma.candidateShortlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shortlist:", error);
    return NextResponse.json(
      { error: "Failed to delete shortlist" },
      { status: 500 }
    );
  }
}
