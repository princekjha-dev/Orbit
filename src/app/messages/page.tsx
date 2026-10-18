import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { MessagesHub } from "@/components/chat/messages-hub";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages & Coworker Dots | Orbit" };

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/messages");
  }

  const rawConversations = await safeDbCall(
    () =>
      prisma.conversationMember.findMany({
        where: { userId: user.id! },
        include: {
          conversation: {
            include: {
              members: {
                include: { user: { select: { id: true, name: true, image: true } } },
              },
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                where: { isDeleted: false },
              },
            },
          },
        },
        orderBy: { conversation: { updatedAt: "desc" } },
      }),
    []
  );

  const formattedConversations = (rawConversations || []).map(
    ({ conversation, lastReadAt }: any) => {
      const otherMembers = conversation.members.filter((m: any) => m.userId !== user.id);
      const lastMsg = conversation.messages[0];
      const isUnread =
        lastMsg && lastReadAt && new Date(lastMsg.createdAt) > new Date(lastReadAt);
      const displayName = conversation.isGroup
        ? conversation.name || otherMembers.map((m: any) => m.user.name).join(", ")
        : otherMembers[0]?.user.name || "Conversation";
      const displayImage = conversation.isGroup ? null : otherMembers[0]?.user.image;

      return {
        id: conversation.id,
        isGroup: conversation.isGroup,
        name: conversation.name,
        lastReadAt,
        updatedAt: conversation.updatedAt,
        displayName,
        displayImage,
        lastMsg: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
            }
          : null,
        isUnread,
      };
    }
  );

  return (
    <MessagesHub
      currentUserId={user.id!}
      currentUserName={user.name || "Member"}
      conversations={formattedConversations}
    />
  );
}
