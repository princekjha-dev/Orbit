import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blockerId = session.user.id;
  if (blockerId === targetUserId) {
    return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
  }

  try {
    const existing = await prisma.blockUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: targetUserId,
        },
      },
    });

    if (existing) {
      await prisma.blockUser.delete({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId: targetUserId,
          },
        },
      });
      return NextResponse.json({ blocked: false });
    } else {
      await prisma.blockUser.create({
        data: {
          blockerId,
          blockedId: targetUserId,
        },
      });

      // Remove existing connections if any
      await prisma.connection.deleteMany({
        where: {
          OR: [
            { senderId: blockerId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: blockerId },
          ],
        },
      });

      return NextResponse.json({ blocked: true });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to block user" }, { status: 500 });
  }
}
