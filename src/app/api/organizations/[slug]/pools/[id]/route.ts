import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";

// GET /api/organizations/[slug]/pools/[id] - get talent pool with enriched candidate evidence
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await params;
    const organization = await resolveOrganization(slug);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!verifyOrgAccess(organization, user.id, (user as any).role, ["OWNER", "ADMIN", "MEMBER"])) {
      return NextResponse.json({ error: "Forbidden: Private talent pool" }, { status: 403 });
    }

    const pool = await prisma.talentPool.findUnique({
      where: { id },
      include: {
        candidates: {
          include: {
            candidate: {
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
                  select: { id: true, projectTitle: true },
                },
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    return NextResponse.json({
      pool: {
        ...pool,
        candidates: pool.candidates.map((c) => ({
          id: c.id,
          candidateId: c.candidateId,
          notes: c.notes,
          tags: c.tags,
          addedAt: c.addedAt,
          candidate: {
            id: c.candidate.id,
            name: c.candidate.name,
            username: c.candidate.username,
            image: c.candidate.image,
            headline: c.candidate.profile?.headline || null,
            location: c.candidate.profile?.location || null,
            skills: (c.candidate.profile?.skills || []).map((s) => s.skill.name),
            verifiedCount: c.candidate.verifiedWorkRecords.length,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching talent pool detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent pool detail" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[slug]/pools/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await params;
    const organization = await resolveOrganization(slug);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!verifyOrgAccess(organization, user.id, (user as any).role, ["OWNER", "ADMIN", "MEMBER"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.talentPool.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pool:", error);
    return NextResponse.json(
      { error: "Failed to delete pool" },
      { status: 500 }
    );
  }
}
