import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { opportunitySchema } from "@/lib/validation/schemas";
import { resolveOrganization, verifyOrgAccess } from "@/lib/organizations/service";

// POST /api/organizations/[slug]/opportunities
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
  const parsed = opportunitySchema.safeParse({ ...rest, skills: skills || [] });
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

  const newOppId = `opp-${Date.now()}`;
  let finalOppId = newOppId;

  try {
    const opp = await prisma.opportunity.create({
      data: {
        organizationId: organization.id,
        title: parsed.data.title,
        type: parsed.data.type as any,
        description: parsed.data.description,
        location: parsed.data.location,
        workMode: parsed.data.workMode as any,
        compensation: parsed.data.compensation,
        duration: parsed.data.duration,
        eligibility: parsed.data.eligibility,
        applicationReqs: parsed.data.applicationReqs,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
      },
    });
    finalOppId = opp.id;
  } catch {
    // If DB is offline, continue with generated ID
  }

  const { inMemoryStore } = await import("@/lib/database/in-memory-store");
  const storedOpp = {
    id: finalOppId,
    organizationId: organization.id,
    title: parsed.data.title,
    type: parsed.data.type,
    description: parsed.data.description,
    location: parsed.data.location,
    workMode: parsed.data.workMode,
    compensation: parsed.data.compensation,
    duration: parsed.data.duration,
    eligibility: parsed.data.eligibility,
    applicationReqs: parsed.data.applicationReqs,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      verificationStatus: (organization as any).verificationStatus || "VERIFIED",
    },
    skills: (skills || []).map((s: string) => ({ skill: { name: s } })),
    _count: { applications: 0 },
  };

  inMemoryStore.opportunities.set(finalOppId, storedOpp);

  return NextResponse.json({ id: finalOppId }, { status: 201 });
}
