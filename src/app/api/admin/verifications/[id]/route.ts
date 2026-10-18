import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { action, adminNotes } = await req.json();
  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid action" } },
      { status: 400 }
    );
  }

  const newStatus = action === "approve" ? "VERIFIED" : "UNVERIFIED";

  safeDbCall(async () => {
    const verification = await prisma.organizationVerification.findUnique({
      where: { id },
    });
    if (verification) {
      await prisma.$transaction([
        prisma.organizationVerification.update({
          where: { id },
          data: {
            status: newStatus as any,
            reviewedAt: new Date(),
            reviewedBy: user.id!,
            adminNotes: adminNotes || null,
          },
        }),
        prisma.organization.update({
          where: { id: verification.organizationId },
          data: { verificationStatus: newStatus as any },
        }),
        prisma.auditLog.create({
          data: {
            actorId: user.id!,
            action: `verification_${action}`,
            entityType: "Organization",
            entityId: verification.organizationId,
            metadata: { adminNotes },
          },
        }),
      ]);
    }
  });

  return NextResponse.json({ success: true, status: newStatus });
}
