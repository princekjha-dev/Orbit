import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

// POST /api/messages/[id] — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const { content, replyToId } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Content is required" } },
      { status: 400 }
    );
  }

  // Attempt database write
  const message = await safeDbCall(
    () =>
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: user.id!,
          content: content.trim(),
          replyToId: replyToId || null,
          type: "TEXT",
        },
      }),
    { id: `msg-fallback-${Date.now()}` } as any
  );

  safeDbCall(() =>
    prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })
  );

  return NextResponse.json({ success: true, id: message?.id }, { status: 201 });
}

// GET /api/messages/[id] — get messages (polling fallback)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const after = req.nextUrl.searchParams.get("after");
  const messages = await safeDbCall(
    () =>
      prisma.message.findMany({
        where: {
          conversationId: id,
          isDeleted: false,
          ...(after ? { createdAt: { gt: new Date(after) } } : {}),
        },
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
    []
  );

  return NextResponse.json({ success: true, messages: messages || [] });
}
