import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateCommunitySchema = z.object({
  description: z.string().min(10).max(500).optional(),
  rules: z.string().max(2000).optional(),
  category: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      creator: { select: { id: true, name: true, username: true, image: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
        },
        orderBy: { joinedAt: "asc" },
        take: 50,
      },
      _count: { select: { members: true, posts: true } },
    },
  });

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const userMembership = currentUserId
    ? community.members.find((m) => m.userId === currentUserId)
    : null;

  return NextResponse.json({
    community: {
      ...community,
      memberCount: community._count.members,
      postCount: community._count.posts,
      currentUserRole: userMembership?.role || null,
      isMember: !!userMembership,
    },
  });
}

export async function PATCH(
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

  const member = community.members[0];
  const isCreatorOrAdmin = community.creatorId === session.user.id || member?.role === "ADMIN";

  if (!isCreatorOrAdmin) {
    return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateCommunitySchema.parse(body);

    const updated = await prisma.community.update({
      where: { slug },
      data: parsed,
    });

    return NextResponse.json({ community: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update community" }, { status: 500 });
  }
}
