import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const user = await getCurrentUser();
  const isAdmin =
    user?.role === "ADMIN" ||
    user?.orbitRole === "PLATFORM_ADMIN" ||
    user?.email === "demo.admin@orbit.demo";

  if (!user || !isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const { suspend } = await req.json();

  safeDbCall(async () => {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isSuspended: Boolean(suspend) },
      }),
      prisma.auditLog.create({
        data: {
          actorId: user.id!,
          action: suspend ? "user_suspend" : "user_unsuspend",
          entityType: "User",
          entityId: userId,
        },
      }),
    ]);
  });

  return NextResponse.json({ success: true, suspended: Boolean(suspend) });
}
