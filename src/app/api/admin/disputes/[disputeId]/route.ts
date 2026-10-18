import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  const { disputeId } = await params;
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

  const { action } = await req.json();
  const newStatus = action === "resolve" ? "RESOLVED" : "CLOSED";

  safeDbCall(async () => {
    await prisma.$transaction([
      prisma.dispute.update({
        where: { id: disputeId },
        data: { status: newStatus as any, resolvedAt: new Date(), resolvedBy: user.id! },
      }),
      prisma.auditLog.create({
        data: {
          actorId: user.id!,
          action: `dispute_${action}`,
          entityType: "Dispute",
          entityId: disputeId,
        },
      }),
    ]);
  });

  return NextResponse.json({ success: true, status: newStatus });
}
