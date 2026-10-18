import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore, StoredPost } from "@/lib/database/in-memory-store";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  content: z.string().min(5, "Content must be at least 5 characters").max(5000),
  category: z.enum(["DISCUSSION", "RESOURCE", "EVENT", "ANNOUNCEMENT"]).default("DISCUSSION"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const community = await safeDbCall(
    () => prisma.community.findUnique({ where: { slug } }),
    { id: `comm-${slug}`, name: slug, slug } as any
  );

  const user = await getCurrentUser();
  const currentUserId = user?.id;

  const where: any = { communityId: community?.id };
  if (category && category !== "ALL") {
    where.category = category;
  }

  const dbPosts = await safeDbCall(
    () =>
      prisma.communityPost.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          _count: { select: { comments: true } },
          savedBy: currentUserId ? { where: { userId: currentUserId } } : false,
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 50,
      }),
    []
  );

  // Combine with in-memory store posts for this community
  const inMemPosts = inMemoryStore.posts
    .filter((p) => p.communitySlug === slug)
    .map((p) => ({
      id: p.id,
      title: p.content.slice(0, 40) + "...",
      content: p.content,
      category: "DISCUSSION",
      isPinned: false,
      createdAt: new Date(p.createdAt),
      authorId: p.authorId,
      author: {
        id: p.authorId,
        name: p.authorName,
        username: p.authorName.toLowerCase().replace(/\s+/g, ""),
        image: p.authorImage || null,
      },
      commentCount: p.comments.length,
      isSaved: false,
      isAuthor: currentUserId === p.authorId,
    }));

  const allPosts = [
    ...inMemPosts,
    ...(dbPosts || []).map((p: any) => ({
      ...p,
      commentCount: p._count?.comments || 0,
      isSaved: currentUserId ? (p.savedBy?.length ?? 0) > 0 : false,
      isAuthor: currentUserId === p.authorId,
    })),
  ];

  return NextResponse.json({ success: true, posts: allPosts });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to post." } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid post data",
          },
        },
        { status: 400 }
      );
    }

    const newPostId = `post-${Date.now()}`;
    const inMemPost: StoredPost = {
      id: newPostId,
      communitySlug: slug,
      authorId: user.id,
      authorName: user.name || "Member",
      authorImage: user.image || null,
      content: parsed.data.content,
      tags: [parsed.data.category.toLowerCase()],
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    inMemoryStore.posts.unshift(inMemPost);

    // Also persist to DB if online
    safeDbCall(async () => {
      const community = await prisma.community.findUnique({ where: { slug } });
      if (community) {
        // Auto-join if not member
        await prisma.communityMember.upsert({
          where: {
            communityId_userId: { communityId: community.id, userId: user.id! },
          },
          update: {},
          create: {
            communityId: community.id,
            userId: user.id!,
            role: "MEMBER",
          },
        });

        await prisma.communityPost.create({
          data: {
            id: newPostId,
            communityId: community.id,
            authorId: user.id!,
            title: parsed.data.title,
            content: parsed.data.content,
            category: parsed.data.category,
          },
        });
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newPostId,
          title: parsed.data.title,
          content: parsed.data.content,
          author: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
          createdAt: inMemPost.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: err?.message || "Failed to create post" },
      },
      { status: 500 }
    );
  }
}
