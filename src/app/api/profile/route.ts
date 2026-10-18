import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { profileSchema } from "@/lib/validation/schemas";
import { inMemoryStore } from "@/lib/database/in-memory-store";

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { skills, ...rest } = body;
  const parsed = profileSchema.safeParse({ ...rest, skills: skills || [] });
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Validation error",
        },
      },
      { status: 400 }
    );
  }

  // Update in-memory profile store
  inMemoryStore.userProfiles.set(user.id!, {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  });

  // Safe database update
  safeDbCall(async () => {
    const skillRecords = await Promise.all(
      (skills || []).map((name: string) =>
        prisma.skill.upsert({
          where: { name: name.trim() },
          update: {},
          create: { name: name.trim() },
        })
      )
    );

    await prisma.profile.upsert({
      where: { userId: user.id! },
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
        userId: user.id!,
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
  });

  return NextResponse.json({ success: true, updated: true });
}
