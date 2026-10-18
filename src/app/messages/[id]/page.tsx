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

  // Check if this route is for one of the Four Coworker Dots
  if (["avis", "scout", "quill", "relay"].includes(id)) {
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

  if (!conversation && !membership) {
    // If not found in DB, return 404
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

  const otherMembers = (conversation?.members || []).filter(
    (m: any) => m.userId !== user.id
  );
  const title = conversation?.isGroup
    ? conversation.name || otherMembers.map((m: any) => m.user?.name).join(", ")
    : otherMembers[0]?.user?.name || "Direct Message";

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
      <MessageThread
        conversationId={id}
        currentUserId={user.id!}
        currentUserName={user.name!}
        title={title}
        members={(conversation?.members as any) || []}
        initialMessages={(conversation?.messages as any) || []}
      />
    </div>
  );
}
