import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { projectApplicationSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = projectApplicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  const project = await prisma.project.findUnique({ where: { id, isDeleted: false, status: "OPEN" } });
  if (!project) return NextResponse.json({ error: "Project not found or not open" }, { status: 404 });

  const existing = await prisma.projectApplication.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id! } },
  });
  if (existing) return NextResponse.json({ error: "You have already applied" }, { status: 409 });

  const app = await prisma.projectApplication.create({
    data: {
      projectId: id,
      userId: session.user.id!,
      proposal: parsed.data.proposal,
      workSamples: parsed.data.workSamples,
      availability: parsed.data.availability,
    },
  });

  return NextResponse.json({ id: app.id }, { status: 201 });
}
