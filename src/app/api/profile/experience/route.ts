import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  location: z.string().optional(),
  startMonth: z.number().int().min(1).max(12).optional().nullable(),
  startYear: z.number().int().min(1990).max(2030),
  endMonth: z.number().int().min(1).max(12).optional().nullable(),
  endYear: z.number().int().min(1990).max(2035).optional().nullable(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
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

  const expId = `exp-${Date.now()}`;

  safeDbCall(async () => {
    const profile = await prisma.profile.upsert({
      where: { userId: user.id! },
      update: {},
      create: { userId: user.id! },
    });

    await prisma.experience.create({
      data: {
        id: expId,
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
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id: expId,
        title: parsed.data.title,
        company: parsed.data.company,
      },
    },
    { status: 201 }
  );
}
