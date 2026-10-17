import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";

// GET /api/organizations/[slug]/pools - list private talent pools
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const organization = await resolveOrganization(slug);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Strict authorization
    if (!verifyOrgAccess(organization, user.id, (user as any).role, ["OWNER", "ADMIN", "MEMBER"])) {
      return NextResponse.json({ error: "Forbidden: Talent pools are private to organization members" }, { status: 403 });
    }

    const pools = await prisma.talentPool.findMany({
      where: { organizationId: organization.id },
      include: {
        _count: { select: { candidates: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ pools });
  } catch (error) {
    console.error("Error fetching talent pools:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent pools" },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[slug]/pools - create new private talent pool
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const organization = await resolveOrganization(slug);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!verifyOrgAccess(organization, user.id, (user as any).role, ["OWNER", "ADMIN", "MEMBER"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, tags } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Pool name is required" }, { status: 400 });
    }

    const pool = await prisma.talentPool.create({
      data: {
        organizationId: organization.id,
        name: name.trim(),
        description: description?.trim() || null,
        tags: tags ? String(tags) : null,
      },
    });

    return NextResponse.json({ pool }, { status: 201 });
  } catch (error) {
    console.error("Error creating talent pool:", error);
    return NextResponse.json(
      { error: "Failed to create talent pool" },
      { status: 500 }
    );
  }
}
