import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { z } from "zod";

const saveSearchSchema = z.object({
  category: z.string().default("ALL"),
  query: z.string().min(1).max(200),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const saved = await safeDbCall(
    () =>
      prisma.savedSearch.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    []
  );

  return NextResponse.json({ success: true, searches: saved || [] });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = saveSearchSchema.parse(body);

    const saved = await safeDbCall(
      () =>
        prisma.savedSearch.create({
          data: {
            userId: user.id!,
            category: parsed.category,
            query: parsed.query,
          },
        }),
      { id: `search-${Date.now()}`, ...parsed } as any
    );

    return NextResponse.json({ success: true, saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: err.message || "Failed to save search" } },
      { status: 500 }
    );
  }
}
