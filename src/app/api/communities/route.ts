import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createCommunitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  category: z.string().min(2, "Category is required"),
  rules: z.string().max(2000).optional(),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const session = await auth();
  const currentUserId = session?.user?.id;

  const communities = await prisma.community.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, username: true } },
      _count: { select: { members: true, posts: true } },
      members: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { role: true },
          }
        : false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    communities: communities.map((c) => ({
      ...c,
      memberCount: c._count.members,
      postCount: c._count.posts,
      currentUserRole: currentUserId && c.members?.[0]?.role ? c.members[0].role : null,
      isMember: currentUserId && (c.members?.length ?? 0) > 0,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createCommunitySchema.parse(body);

    let baseSlug = slugify(parsed.name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.community.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const community = await prisma.community.create({
      data: {
        slug,
        name: parsed.name,
        description: parsed.description,
        category: parsed.category,
        rules: parsed.rules || null,
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
    });

    return NextResponse.json({ community }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create community" }, { status: 500 });
  }
}
