import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { VerificationStatus } from "@prisma/client";

// PATCH /api/admin/credentials/[id] - verify or reject credential
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
    const { isVerified, notes } = body;

    const credential = await prisma.organizationCredential.update({
      where: { id },
      data: {
        isVerified: Boolean(isVerified),
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: user.id,
        ...(notes !== undefined ? { notes: String(notes) } : {}),
      },
    });

    // If verified, also ensure organization is marked VERIFIED
    if (isVerified) {
      await prisma.organization.update({
        where: { id: credential.organizationId },
        data: { verificationStatus: VerificationStatus.VERIFIED },
      });
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: `ORG_CREDENTIAL_${isVerified ? "VERIFIED" : "UNVERIFIED"}`,
        entityType: "OrganizationCredential",
        entityId: id,
        metadata: { orgId: credential.organizationId, isVerified },
      },
    });

    return NextResponse.json({ credential });
  } catch (error) {
    console.error("Error updating organization credential:", error);
    return NextResponse.json(
      { error: "Failed to update organization credential" },
      { status: 500 }
    );
  }
}
