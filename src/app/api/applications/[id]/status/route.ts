import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";
import { z } from "zod";

const schema = z.object({
  status: z.enum([
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
    "OFFER",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ]),
});

export async function PATCH(
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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid status value" } },
      { status: 400 }
    );
  }

  // Update in-memory applications if present
  for (const [key, app] of inMemoryStore.applications.entries()) {
    if (app.id === id || key === id) {
      app.status = parsed.data.status as any;
      app.updatedAt = new Date().toISOString();
      return NextResponse.json({ success: true, status: app.status });
    }
  }

  const dbStatus = (parsed.data.status === "HIRED" || parsed.data.status === "OFFER"
    ? "SELECTED"
    : parsed.data.status) as any;

  // Update in database if present
  const updated: any = await safeDbCall(
    () =>
      prisma.opportunityApplication.update({
        where: { id },
        data: { status: dbStatus },
      }),
    { status: parsed.data.status } as any
  );

  return NextResponse.json({ success: true, status: updated?.status || parsed.data.status });
}
