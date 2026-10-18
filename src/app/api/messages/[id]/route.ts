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

  // Also persist in demo conversation store for instant live preview and persistence
  const { INITIAL_DEMO_CONVERSATIONS } = await import("@/lib/demo/demo-messages");
  const demoConv = INITIAL_DEMO_CONVERSATIONS.find((c) => c.id === id);
  if (demoConv) {
    demoConv.messages.push({
      id: message?.id || `msg-${Date.now()}`,
      conversationId: id,
      senderId: user.id!,
      senderName: user.name || "Member",
      senderUsername: (user as any).username || "member",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });
    demoConv.updatedAt = new Date().toISOString();
  }

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
  const dbMessages = await safeDbCall(
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

  if (dbMessages && dbMessages.length > 0) {
    return NextResponse.json({ success: true, messages: dbMessages });
  }

  // Fallback to demo conversation messages
  const { INITIAL_DEMO_CONVERSATIONS } = await import("@/lib/demo/demo-messages");
  const demoConv = INITIAL_DEMO_CONVERSATIONS.find((c) => c.id === id);
  const demoMsgs = (demoConv?.messages || [])
    .filter((m) => !after || new Date(m.createdAt) > new Date(after))
    .map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      senderId: m.senderId,
      sender: { id: m.senderId, name: m.senderName, image: null },
    }));

  return NextResponse.json({ success: true, messages: demoMsgs });
}
