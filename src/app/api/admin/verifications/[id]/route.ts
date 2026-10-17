import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { action, adminNotes } = await req.json();
  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const verification = await prisma.organizationVerification.findUnique({
    where: { id },
  });
  if (!verification) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = action === "approve" ? "VERIFIED" : "UNVERIFIED";

  await prisma.$transaction([
    prisma.organizationVerification.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: session.user.id!,
        adminNotes: adminNotes || null,
      },
    }),
    prisma.organization.update({
      where: { id: verification.organizationId },
      data: { verificationStatus: newStatus },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id!,
        action: `verification_${action}`,
        entityType: "Organization",
        entityId: verification.organizationId,
        metadata: { adminNotes },
      },
    }),
  ]);

  return NextResponse.json({ status: newStatus });
}
