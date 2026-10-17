import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  try {
    const member = await prisma.communityMember.upsert({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: session.user.id,
        },
      },
      update: {},
      create: {
        communityId: community.id,
        userId: session.user.id,
        role: "MEMBER",
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: "COMMUNITY_JOINED",
        title: `Joined community ${community.name}`,
        referenceId: community.id,
      },
    });

    return NextResponse.json({ member });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to join community" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId") || session.user.id;

  // If removing someone else, must be admin
  if (targetUserId !== session.user.id) {
    const adminCheck = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: session.user.id,
        },
      },
    });

    if (adminCheck?.role !== "ADMIN" && community.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }
  }

  try {
    await prisma.communityMember.delete({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: targetUserId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to leave/remove member" }, { status: 500 });
  }
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

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const adminCheck = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId: community.id,
        userId: session.user.id,
      },
    },
  });

  if (adminCheck?.role !== "ADMIN" && community.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !["ADMIN", "MODERATOR", "MEMBER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role or userId" }, { status: 400 });
  }

  const updated = await prisma.communityMember.update({
    where: {
      communityId_userId: {
        communityId: community.id,
        userId,
      },
    },
    data: { role },
  });

  return NextResponse.json({ member: updated });
}
