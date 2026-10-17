import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  projectIdea: z.string().optional(),
  rolesNeeded: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  const team = await prisma.hackathonTeam.create({
    data: {
      ...parsed.data,
      githubUrl: parsed.data.githubUrl || null,
      isOpen: true,
      members: {
        create: { userId: session.user.id!, role: "OWNER" },
      },
    },
  });

  return NextResponse.json({ id: team.id }, { status: 201 });
}
