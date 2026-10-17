import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { OrgCredentialType } from "@prisma/client";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";

// GET /api/organizations/[slug]/credentials
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const organization = await resolveOrganization(slug);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const credentials = await prisma.organizationCredential.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      organization: { id: organization.id, name: organization.name, verificationStatus: organization.verificationStatus },
      credentials,
    });
  } catch (error) {
    console.error("Error fetching organization credentials:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization credentials" },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[slug]/credentials
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

    if (!verifyOrgAccess(organization, user.id, (user as any).role, ["OWNER", "ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { type, issuer, identifier, documentUrl, notes } = body;

    if (!type || !issuer || !identifier) {
      return NextResponse.json(
        { error: "type, issuer, and identifier are required" },
        { status: 400 }
      );
    }

    const credential = await prisma.organizationCredential.create({
      data: {
        organizationId: organization.id,
        type: type as OrgCredentialType,
        issuer: issuer.trim(),
        identifier: identifier.trim(),
        documentUrl: documentUrl?.trim() || null,
        notes: notes?.trim() || null,
        isVerified: false,
      },
    });

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    console.error("Error creating organization credential:", error);
    return NextResponse.json(
      { error: "Failed to create organization credential" },
      { status: 500 }
    );
  }
}
