import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// PATCH /api/credentials/portable/[id]/revoke - revoke a portable credential
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const credential = await prisma.portableEvidenceCredential.findUnique({
      where: { id },
    });

    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    if (credential.userId !== user.id && (user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.portableEvidenceCredential.update({
      where: { id },
      data: { isRevoked: true },
    });

    return NextResponse.json({ credential: updated });
  } catch (error) {
    console.error("Error revoking credential:", error);
    return NextResponse.json(
      { error: "Failed to revoke credential" },
      { status: 500 }
    );
  }
}
