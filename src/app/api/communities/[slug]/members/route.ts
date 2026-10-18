import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const member = await safeDbCall(async () => {
    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) return null;

    return prisma.communityMember.upsert({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: user.id!,
        },
      },
      update: {},
      create: {
        communityId: community.id,
        userId: user.id!,
        role: "MEMBER",
      },
    });
  }, { id: `mem-${user.id}`, role: "MEMBER" } as any);

  return NextResponse.json({ success: true, member });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  safeDbCall(async () => {
    const community = await prisma.community.findUnique({ where: { slug } });
    if (community) {
      await prisma.communityMember.deleteMany({
        where: {
          communityId: community.id,
          userId: user.id!,
        },
      });
    }
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { userId, role } = body;

  safeDbCall(async () => {
    const community = await prisma.community.findUnique({ where: { slug } });
    if (community) {
      await prisma.communityMember.updateMany({
        where: {
          communityId: community.id,
          userId,
        },
        data: { role },
      });
    }
  });

  return NextResponse.json({ success: true, member: { userId, role } });
}
