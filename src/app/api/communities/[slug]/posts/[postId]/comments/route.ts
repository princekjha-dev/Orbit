import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore, StoredComment } from "@/lib/database/in-memory-store";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { postId } = await params;

  const dbComments = await safeDbCall(
    () =>
      prisma.communityComment.findMany({
        where: { postId },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
    []
  );

  // In-memory comments
  const post = inMemoryStore.posts.find((p) => p.id === postId);
  const inMemComments = (post?.comments || []).map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: new Date(c.createdAt),
    author: {
      id: c.authorId,
      name: c.authorName,
      username: c.authorName.toLowerCase().replace(/\s+/g, ""),
      image: null,
    },
  }));

  const comments = [...(inMemComments || []), ...(dbComments || [])];

  return NextResponse.json({ success: true, comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { slug, postId } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to comment" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = commentSchema.parse(body);

    const commentId = `com-${Date.now()}`;
    const newComment: StoredComment = {
      id: commentId,
      postId,
      authorId: user.id,
      authorName: user.name || "Member",
      content: parsed.content,
      createdAt: new Date().toISOString(),
    };

    const post = inMemoryStore.posts.find((p) => p.id === postId);
    if (post) {
      post.comments.push(newComment);
      post.commentsCount = post.comments.length;
    }

    safeDbCall(() =>
      prisma.communityComment.create({
        data: {
          id: commentId,
          postId,
          authorId: user.id!,
          content: parsed.content,
        },
      })
    );

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: commentId,
          content: parsed.content,
          createdAt: newComment.createdAt,
          author: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: err.message || "Failed to post comment" } },
      { status: 500 }
    );
  }
}
