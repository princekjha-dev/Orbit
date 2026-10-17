import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { PipelineType } from "@prisma/client";

// GET /api/recruiter/shortlists - list shortlists accessible to current user
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");

    // Get organizations where user is an authorized member
    const userOrgs = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      select: { organizationId: true, role: true },
    });

    const userOrgIds = userOrgs.map((o) => o.organizationId);

    if (userOrgIds.length === 0 && (user as any).role !== "ADMIN") {
      return NextResponse.json({ shortlists: [] });
    }

    const shortlists = await prisma.candidateShortlist.findMany({
      where: {
        organizationId: orgId
          ? orgId
          : (user as any).role === "ADMIN"
          ? undefined
          : { in: userOrgIds },
      },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { candidates: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ shortlists });
  } catch (error) {
    console.error("Error fetching shortlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch shortlists" },
      { status: 500 }
    );
  }
}

// POST /api/recruiter/shortlists - create new shortlist
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, name, role, pipelineType = "JOB", description, isPrivate = true } = body;

    if (!organizationId || !name || !role) {
      return NextResponse.json(
        { error: "organizationId, name, and role are required" },
        { status: 400 }
      );
    }

    // Verify user belongs to organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    });

    if (!membership && (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized for this organization" },
        { status: 403 }
      );
    }

    const shortlist = await prisma.candidateShortlist.create({
      data: {
        organizationId,
        name: name.trim(),
        role: role.trim(),
        pipelineType: pipelineType as PipelineType,
        description: description?.trim() || null,
        isPrivate: Boolean(isPrivate),
      },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { candidates: true } },
      },
    });

    return NextResponse.json({ shortlist }, { status: 201 });
  } catch (error) {
    console.error("Error creating shortlist:", error);
    return NextResponse.json(
      { error: "Failed to create shortlist" },
      { status: 500 }
    );
  }
}
