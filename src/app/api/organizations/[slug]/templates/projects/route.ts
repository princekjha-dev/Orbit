import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";

// GET /api/organizations/[slug]/templates/projects
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

    const templates = await prisma.projectTemplate.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching project templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[slug]/templates/projects
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
    const { name, problemTemplate, scopeTemplate, expectedHours, milestoneTemplates, deliverableTemplate } = body;

    if (!name || !scopeTemplate || !deliverableTemplate) {
      return NextResponse.json(
        { error: "name, scopeTemplate, and deliverableTemplate are required" },
        { status: 400 }
      );
    }

    const template = await prisma.projectTemplate.create({
      data: {
        organizationId: organization.id,
        name: name.trim(),
        problemTemplate: problemTemplate?.trim() || null,
        scopeTemplate: scopeTemplate.trim(),
        expectedHours: expectedHours ? Number(expectedHours) : null,
        milestoneTemplates: milestoneTemplates || null,
        deliverableTemplate: deliverableTemplate.trim(),
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating project template:", error);
    return NextResponse.json(
      { error: "Failed to create project template" },
      { status: 500 }
    );
  }
}
