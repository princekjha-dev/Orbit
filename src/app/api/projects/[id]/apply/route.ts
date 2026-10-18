import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { projectApplicationSchema } from "@/lib/validation/schemas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = projectApplicationSchema.safeParse(body);
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

  const appId = `proj-app-${Date.now()}`;

  safeDbCall(() =>
    prisma.projectApplication.create({
      data: {
        id: appId,
        projectId: id,
        userId: user.id!,
        proposal: parsed.data.proposal,
        workSamples: parsed.data.workSamples,
        availability: parsed.data.availability,
      },
    })
  );

  return NextResponse.json({ success: true, id: appId }, { status: 201 });
}
