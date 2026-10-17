import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { postId } = await params;

  const comments = await prisma.communityComment.findMany({
    where: { postId },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { slug, postId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      members: { where: { userId: session.user.id } },
    },
  });

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  if (community.members.length === 0) {
    return NextResponse.json({ error: "Join this community to comment" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = commentSchema.parse(body);

    const comment = await prisma.communityComment.create({
      data: {
        postId,
        authorId: session.user.id,
        content: parsed.content,
      },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to post comment" }, { status: 500 });
  }
}
