import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  institution: z.string().min(2),
  degree: z.string().optional(),
  field: z.string().optional(),
  startYear: z.number().int().min(1990).max(2030),
  endYear: z.number().int().min(1990).max(2035).optional().nullable(),
  current: z.boolean().optional(),
});

async function ensureProfile(userId: string) {
  return prisma.profile.upsert({ where: { userId }, update: {}, create: { userId } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  const profile = await ensureProfile(session.user.id!);

  const edu = await prisma.education.create({
    data: {
      profileId: profile.id,
      institution: parsed.data.institution,
      degree: parsed.data.degree,
      field: parsed.data.field,
      startYear: parsed.data.startYear,
      endYear: parsed.data.endYear,
      current: parsed.data.current ?? false,
    },
  });

  return NextResponse.json(edu, { status: 201 });
}
