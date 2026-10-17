import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { MessageThread } from "@/components/chat/message-thread";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Chat | Orbit" };

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireAuth();

  // Verify user is a member
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: user.id! } },
  });
  if (!membership) notFound();

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true, username: true } } },
      },
      messages: {
        where: { isDeleted: false },
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
        take: 100,
      },
    },
  });

  if (!conversation) notFound();

  // Mark as read
  await prisma.conversationMember.update({
    where: { conversationId_userId: { conversationId: id, userId: user.id! } },
    data: { lastReadAt: new Date() },
  });

  const otherMembers = conversation.members.filter((m) => m.userId !== user.id);
  const title = conversation.isGroup
    ? conversation.name || otherMembers.map((m) => m.user.name).join(", ")
    : otherMembers[0]?.user.name || "Conversation";

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
      <MessageThread
        conversationId={id}
        currentUserId={user.id!}
        currentUserName={user.name!}
        title={title}
        members={conversation.members as any}
        initialMessages={conversation.messages as any}
      />
    </div>
  );
}
