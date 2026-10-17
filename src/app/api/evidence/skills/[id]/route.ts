import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// DELETE /api/evidence/skills/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.skillEvidence.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    if (existing.userId !== user.id && (user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.skillEvidence.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting skill evidence:", error);
    return NextResponse.json(
      { error: "Failed to delete skill evidence" },
      { status: 500 }
    );
  }
}
