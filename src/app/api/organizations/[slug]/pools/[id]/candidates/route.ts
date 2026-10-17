import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";

// POST /api/organizations/[slug]/pools/[id]/candidates - add candidate to pool
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id: poolId } = await params;
    const organization = await resolveOrganization(slug);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!verifyOrgAccess(organization, user.id, (user as any).role, ["OWNER", "ADMIN", "MEMBER"])) {
      return NextResponse.json({ error: "Forbidden: Private talent pool" }, { status: 403 });
    }

    const body = await req.json();
    const { candidateId, notes, tags } = body;

    if (!candidateId) {
      return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
    }

    const membership = await prisma.talentPoolCandidate.upsert({
      where: {
        poolId_candidateId: {
          poolId,
          candidateId,
        },
      },
      update: {
        notes: notes ? String(notes) : undefined,
        tags: tags ? String(tags) : undefined,
      },
      create: {
        poolId,
        candidateId,
        notes: notes?.trim() || null,
        tags: tags ? String(tags) : null,
      },
    });

    return NextResponse.json({ candidate: membership }, { status: 201 });
  } catch (error) {
    console.error("Error adding candidate to pool:", error);
    return NextResponse.json(
      { error: "Failed to add candidate to pool" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[slug]/pools/[id]/candidates?candidateId=...
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id: poolId } = await params;
    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get("candidateId");

    if (!candidateId) {
      return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
    }

    const organization = await resolveOrganization(slug);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!verifyOrgAccess(organization, user.id, (user as any).role, ["OWNER", "ADMIN", "MEMBER"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.talentPoolCandidate.delete({
      where: {
        poolId_candidateId: {
          poolId,
          candidateId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing candidate from pool:", error);
    return NextResponse.json(
      { error: "Failed to remove candidate from pool" },
      { status: 500 }
    );
  }
}
