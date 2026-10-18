import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { organizationSchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = organizationSchema.safeParse(body);
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

  let slug = slugify(parsed.data.name);
  const orgId = `org-${Date.now()}`;

  safeDbCall(async () => {
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    await prisma.organization.create({
      data: {
        id: orgId,
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        industry: parsed.data.industry,
        location: parsed.data.location,
        website: parsed.data.website || null,
        email: parsed.data.email || null,
        members: {
          create: { userId: user.id!, role: "OWNER" },
        },
      },
    });
  });

  return NextResponse.json({ success: true, id: orgId, slug }, { status: 201 });
}
