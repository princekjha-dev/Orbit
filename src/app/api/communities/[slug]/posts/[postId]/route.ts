import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { slug, postId } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  // Remove from in-memory store
  const inMemIndex = inMemoryStore.posts.findIndex((p) => p.id === postId);
  if (inMemIndex !== -1) {
    inMemoryStore.posts.splice(inMemIndex, 1);
  }

  safeDbCall(() => prisma.communityPost.delete({ where: { id: postId } }));

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { slug, postId } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();

  safeDbCall(() =>
    prisma.communityPost.update({
      where: { id: postId },
      data: {
        isPinned: typeof body.isPinned === "boolean" ? body.isPinned : undefined,
      },
    })
  );

  return NextResponse.json({ success: true, post: { id: postId, isPinned: body.isPinned } });
}
