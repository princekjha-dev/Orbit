import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.hackathonMember.findUnique({
    where: { teamId_userId: { teamId, userId: session.user.id! } },
  });
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  const submission = await prisma.hackathonSubmission.create({
    data: {
      teamId,
      title: parsed.data.title,
      description: parsed.data.description,
      githubUrl: parsed.data.githubUrl || null,
      demoUrl: parsed.data.demoUrl || null,
      videoUrl: parsed.data.videoUrl || null,
    },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
