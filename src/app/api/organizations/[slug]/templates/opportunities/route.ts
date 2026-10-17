import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { OpportunityType, WorkMode } from "@prisma/client";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";

// GET /api/organizations/[slug]/templates/opportunities
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

    const templates = await prisma.opportunityTemplate.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching opportunity templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[slug]/templates/opportunities
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
    const {
      name,
      type = "JOB",
      titleTemplate,
      descriptionTemplate,
      requiredSkills,
      workMode = "REMOTE",
      compensationRange,
      duration,
      applicationReqs,
    } = body;

    if (!name || !titleTemplate || !descriptionTemplate) {
      return NextResponse.json(
        { error: "name, titleTemplate, and descriptionTemplate are required" },
        { status: 400 }
      );
    }

    const template = await prisma.opportunityTemplate.create({
      data: {
        organizationId: organization.id,
        name: name.trim(),
        type: type as OpportunityType,
        titleTemplate: titleTemplate.trim(),
        descriptionTemplate: descriptionTemplate.trim(),
        requiredSkills: requiredSkills ? String(requiredSkills) : null,
        workMode: workMode as WorkMode,
        compensationRange: compensationRange?.trim() || null,
        duration: duration?.trim() || null,
        applicationReqs: applicationReqs?.trim() || null,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating opportunity template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
