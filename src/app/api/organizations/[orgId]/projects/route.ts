import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { projectSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, userId: session.user.id!, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { skills, ...rest } = body;
  const parsed = projectSchema.safeParse({ ...rest, skills: skills || [] });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  const skillRecords = await Promise.all(
    (skills || []).map((name: string) =>
      prisma.skill.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const project = await prisma.project.create({
    data: {
      organizationId: orgId,
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
