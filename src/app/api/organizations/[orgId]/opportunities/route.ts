import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { opportunitySchema } from "@/lib/validation/schemas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, userId: session.user.id!, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { skills, ...rest } = body;
  const parsed = opportunitySchema.safeParse({ ...rest, skills: skills || [] });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  const skillRecords = await Promise.all(
    (skills || []).map((name: string) =>
      prisma.skill.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const opp = await prisma.opportunity.create({
    data: {
      organizationId: orgId,
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

  return NextResponse.json({ id: opp.id }, { status: 201 });
}
