import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000),
  category: z.enum(["DISCUSSION", "RESOURCE", "EVENT", "ANNOUNCEMENT"]).default("DISCUSSION"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const session = await auth();
  const currentUserId = session?.user?.id;

  const where: any = { communityId: community.id };
  if (category && category !== "ALL") {
    where.category = category;
  }

  const posts = await prisma.communityPost.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { comments: true } },
      savedBy: currentUserId ? { where: { userId: currentUserId } } : false,
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      commentCount: p._count.comments,
      isSaved: currentUserId ? (p.savedBy?.length ?? 0) > 0 : false,
      isAuthor: currentUserId === p.authorId,
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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
    return NextResponse.json({ error: "You must join this community before posting" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createPostSchema.parse(body);

    const post = await prisma.communityPost.create({
      data: {
        communityId: community.id,
        authorId: session.user.id,
        title: parsed.title,
        content: parsed.content,
        category: parsed.category,
      },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: "COMMUNITY_POST",
        title: `Posted in ${community.name}: "${post.title}"`,
        referenceId: post.id,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create post" }, { status: 500 });
  }
}
