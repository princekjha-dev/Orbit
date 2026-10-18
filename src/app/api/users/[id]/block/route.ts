import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const blockerId = user.id;
  if (blockerId === targetUserId) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "Cannot block yourself" } },
      { status: 400 }
    );
  }

  const result = await safeDbCall(async () => {
    const existing = await prisma.blockUser.findUnique({
      where: {
        blockerId_blockedId: { blockerId, blockedId: targetUserId },
      },
    });

    if (existing) {
      await prisma.blockUser.delete({
        where: {
          blockerId_blockedId: { blockerId, blockedId: targetUserId },
        },
      });
      return false;
    } else {
      await prisma.blockUser.create({
        data: { blockerId, blockedId: targetUserId },
      });
      return true;
    }
  }, true);

  return NextResponse.json({ success: true, blocked: Boolean(result) });
}
