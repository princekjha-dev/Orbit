import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// POST /api/messages/[id] — send a message
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id! } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { content, replyToId } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: session.user.id!,
      content: content.trim(),
      replyToId: replyToId || null,
      type: "TEXT",
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ id: message.id }, { status: 201 });
}

// GET /api/messages/[id] — get messages (polling fallback)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id! } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const after = req.nextUrl.searchParams.get("after");
  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
      isDeleted: false,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json({ messages });
}
