import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { projectSchema } from "@/lib/validation/schemas";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";

// POST /api/organizations/[slug]/projects
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await resolveOrganization(slug);
  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const isAuthorized = verifyOrgAccess(organization, user.id, (user as any).role, ["OWNER", "ADMIN"]);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { skills, ...rest } = body;
  const parsed = projectSchema.safeParse({ ...rest, skills: skills || [] });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation error" },
      { status: 400 }
    );
  }

  const skillRecords = await Promise.all(
    (skills || []).map((name: string) =>
      prisma.skill.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const project = await prisma.project.create({
    data: {
      organizationId: organization.id,
      title: parsed.data.title,
      problem: parsed.data.problem,
      scope: parsed.data.scope,
      deliverable: parsed.data.deliverable,
      acceptanceCriteria: parsed.data.acceptanceCriteria,
      expectedHours: parsed.data.expectedHours,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      payment: parsed.data.payment,
      ipTerms: parsed.data.ipTerms,
      status: "OPEN",
      skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
    },
  });

  return NextResponse.json({ id: project.id }, { status: 201 });
}
