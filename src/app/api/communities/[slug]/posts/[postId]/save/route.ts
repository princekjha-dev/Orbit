import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { postId } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const result = await safeDbCall(async () => {
    const existing = await prisma.savedCommunityPost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id!,
        },
      },
    });

    if (existing) {
      await prisma.savedCommunityPost.delete({
        where: {
          postId_userId: {
            postId,
            userId: user.id!,
          },
        },
      });
      return false;
    } else {
      await prisma.savedCommunityPost.create({
        data: {
          postId,
          userId: user.id!,
        },
      });
      return true;
    }
  }, true);

  return NextResponse.json({ success: true, saved: Boolean(result) });
}
