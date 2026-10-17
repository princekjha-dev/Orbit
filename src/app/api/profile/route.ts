import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validation/schemas";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { skills, ...rest } = body;
  const parsed = profileSchema.safeParse({ ...rest, skills: skills || [] });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  // Upsert skills
  const skillRecords = await Promise.all(
    (skills || []).map((name: string) =>
      prisma.skill.upsert({
        where: { name: name.trim() },
        update: {},
        create: { name: name.trim() },
      })
    )
  );

  // Update profile
  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id! },
    update: {
      headline: parsed.data.headline,
      about: parsed.data.about,
      location: parsed.data.location,
      college: parsed.data.college,
      company: parsed.data.company,
      website: parsed.data.website || null,
      github: parsed.data.github || null,
      linkedin: parsed.data.linkedin || null,
      portfolio: parsed.data.portfolio || null,
      skills: {
        deleteMany: {},
        create: skillRecords.map((s) => ({ skillId: s.id })),
      },
    },
    create: {
      userId: session.user.id!,
      headline: parsed.data.headline,
      about: parsed.data.about,
      location: parsed.data.location,
      college: parsed.data.college,
      company: parsed.data.company,
      website: parsed.data.website || null,
      github: parsed.data.github || null,
      linkedin: parsed.data.linkedin || null,
      portfolio: parsed.data.portfolio || null,
      skills: {
        create: skillRecords.map((s) => ({ skillId: s.id })),
      },
    },
  });

  return NextResponse.json({ id: profile.id });
}
