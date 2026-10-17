import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.savedCommunityPost.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id,
      },
    },
  });

  if (existing) {
    await prisma.savedCommunityPost.delete({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedCommunityPost.create({
      data: {
        postId,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ saved: true });
  }
}
