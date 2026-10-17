import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { slug, postId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      community: {
        include: {
          members: { where: { userId: session.user.id } },
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const isAuthor = post.authorId === session.user.id;
  const member = post.community.members[0];
  const isAdminOrMod =
    post.community.creatorId === session.user.id ||
    member?.role === "ADMIN" ||
    member?.role === "MODERATOR";

  if (!isAuthor && !isAdminOrMod) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.communityPost.delete({ where: { id: postId } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { slug, postId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      community: {
        include: {
          members: { where: { userId: session.user.id } },
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const member = post.community.members[0];
  const isAdminOrMod =
    post.community.creatorId === session.user.id ||
    member?.role === "ADMIN" ||
    member?.role === "MODERATOR";

  if (!isAdminOrMod) {
    return NextResponse.json({ error: "Forbidden: Moderator privileges required" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.communityPost.update({
    where: { id: postId },
    data: {
      isPinned: typeof body.isPinned === "boolean" ? body.isPinned : undefined,
    },
  });

  return NextResponse.json({ post: updated });
}
