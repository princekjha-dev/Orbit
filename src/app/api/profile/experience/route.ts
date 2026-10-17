import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  location: z.string().optional(),
  startMonth: z.number().int().min(1).max(12).optional().nullable(),
  startYear: z.number().int().min(1990).max(2030),
  endMonth: z.number().int().min(1).max(12).optional().nullable(),
  endYear: z.number().int().min(1990).max(2035).optional().nullable(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

async function ensureProfile(userId: string) {
  return prisma.profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  const profile = await ensureProfile(session.user.id!);

  const exp = await prisma.experience.create({
    data: {
      profileId: profile.id,
      title: parsed.data.title,
      company: parsed.data.company,
      location: parsed.data.location,
      startMonth: parsed.data.startMonth ?? 1,
      startYear: parsed.data.startYear,
      endMonth: parsed.data.endMonth,
      endYear: parsed.data.endYear,
      current: parsed.data.current ?? false,
      description: parsed.data.description,
    },
  });

  return NextResponse.json(exp, { status: 201 });
}
