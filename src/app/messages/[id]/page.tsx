import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { MessageThread } from "@/components/chat/message-thread";
import { DotChatView } from "@/components/chat/dot-chat-view";
import { DotId, DOT_METADATA } from "@/lib/ai/dot-agent";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Chat | Orbit" };

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/messages/${id}`);

  // Check if this route is for one of the Coworker Dots
  if (["atlas", "scout", "forge", "signal", "avis", "quill", "relay"].includes(id.toLowerCase())) {
    return (
      <div className="h-[calc(100vh-3.5rem)] lg:h-screen p-4 sm:p-6 max-w-5xl mx-auto flex flex-col">
        <DotChatView
          initialDotId={id as DotId}
          currentUserId={user.id!}
          currentUserName={user.name || "Member"}
        />
      </div>
    );
  }

  // Regular user-to-user or group conversation
  const membership = await safeDbCall(
    () =>
      prisma.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId: id, userId: user.id! } },
      }),
    null
  );

  const conversation = await safeDbCall(
    () =>
      prisma.conversation.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, image: true, username: true } },
            },
          },
          messages: {
            where: { isDeleted: false },
            include: { sender: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: "asc" },
            take: 100,
          },
        },
      }),
    null
  );

  // Check synthetic Indian demo conversations if DB is offline or record is demo
  let activeConv: any = conversation;
  if (!activeConv) {
    const { INITIAL_DEMO_CONVERSATIONS } = await import("@/lib/demo/demo-messages");
    const foundDemo = INITIAL_DEMO_CONVERSATIONS.find((c) => c.id === id);
    if (foundDemo) {
      activeConv = {
        id: foundDemo.id,
        isGroup: foundDemo.isGroup,
        name: foundDemo.title,
        members: foundDemo.participants.map((p) => ({
          userId: p.id,
          user: { id: p.id, name: p.name, image: p.image || null, username: p.username },
        })),
        messages: foundDemo.messages.map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: new Date(m.createdAt),
          senderId: m.senderId,
          sender: { id: m.senderId, name: m.senderName, image: null },
        })),
      };
    }
  }

  if (!activeConv) {
    // If not found in DB or demo store, return 404
    notFound();
  }

  // Mark as read in background if DB is online
  if (membership) {
    safeDbCall(() =>
      prisma.conversationMember.update({
        where: { conversationId_userId: { conversationId: id, userId: user.id! } },
        data: { lastReadAt: new Date() },
      })
    );
  }

  const otherMembers = (activeConv.members || []).filter(
    (m: any) => m.userId !== user.id
  );
  const title = activeConv.isGroup
    ? activeConv.name || otherMembers.map((m: any) => m.user?.name).join(", ")
    : otherMembers[0]?.user?.name || activeConv.name || "Direct Message";

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
      <MessageThread
        conversationId={id}
        currentUserId={user.id!}
        currentUserName={user.name!}
        title={title}
        members={(activeConv.members as any) || []}
        initialMessages={(activeConv.messages as any) || []}
      />
    </div>
  );
}
