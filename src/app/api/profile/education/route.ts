import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  institution: z.string().min(2, "Institution must be at least 2 characters"),
  degree: z.string().optional(),
  field: z.string().optional(),
  startYear: z.number().int().min(1990).max(2030),
  endYear: z.number().int().min(1990).max(2035).optional().nullable(),
  current: z.boolean().optional(),
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

  const eduId = `edu-${Date.now()}`;

  safeDbCall(async () => {
    const profile = await prisma.profile.upsert({
      where: { userId: user.id! },
      update: {},
      create: { userId: user.id! },
    });

    await prisma.education.create({
      data: {
        id: eduId,
        profileId: profile.id,
        institution: parsed.data.institution,
        degree: parsed.data.degree,
        field: parsed.data.field,
        startYear: parsed.data.startYear,
        endYear: parsed.data.endYear,
        current: parsed.data.current ?? false,
      },
    });
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id: eduId,
        institution: parsed.data.institution,
      },
    },
    { status: 201 }
  );
}
