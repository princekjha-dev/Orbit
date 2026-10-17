import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { IdentityStatus } from "@prisma/client";

// PATCH /api/admin/identity/[id] - approve or reject identity verification
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, reason } = body; // action: "APPROVE" | "REJECT"

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json({ error: "Action must be APPROVE or REJECT" }, { status: 400 });
    }

    const verification = await prisma.identityVerification.findUnique({
      where: { id },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    const status = action === "APPROVE" ? IdentityStatus.VERIFIED : IdentityStatus.REJECTED;

    const updated = await prisma.identityVerification.update({
      where: { id },
      data: {
        status,
        rejectionReason: action === "REJECT" ? reason || "Document could not be verified." : null,
        verifiedAt: action === "APPROVE" ? new Date() : null,
        reviewedBy: user.id,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: `IDENTITY_VERIFICATION_${action}`,
        entityType: "IdentityVerification",
        entityId: id,
        metadata: { userId: verification.userId, status },
      },
    });

    return NextResponse.json({ verification: updated });
  } catch (error) {
    console.error("Error updating identity verification:", error);
    return NextResponse.json(
      { error: "Failed to update identity verification" },
      { status: 500 }
    );
  }
}
