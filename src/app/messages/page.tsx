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

  // Merge with synthetic Indian demo conversations
  const { INITIAL_DEMO_CONVERSATIONS } = await import("@/lib/demo/demo-messages");
  const userRole = (user as any).orbitRole || "TALENT";
  const userDemoId =
    userRole === "PLATFORM_ADMIN"
      ? "demo-admin"
      : userRole === "COMMUNITY_ORGANIZER"
      ? "demo-organizer"
      : userRole === "ORGANIZATION_ADMIN"
      ? "demo-organization"
      : `demo-${userRole.toLowerCase()}`;

  const matchingDemoConvs = INITIAL_DEMO_CONVERSATIONS.filter(
    (c) =>
      c.participantIds.includes(user.id!) ||
      c.participantIds.includes(userDemoId) ||
      user.email?.toLowerCase().includes("orbit.demo")
  ).map((c) => {
    const other = c.participants.find((p) => p.id !== user.id && p.id !== userDemoId) || c.participants[0];
    const last = c.messages[c.messages.length - 1];
    return {
      id: c.id,
      isGroup: c.isGroup,
      name: c.title,
      lastReadAt: new Date(),
      updatedAt: new Date(c.updatedAt),
      displayName: c.title,
      displayImage: null,
      lastMsg: last ? { content: last.content, createdAt: new Date(last.createdAt) } : null,
      isUnread: false,
    };
  });

  const allConversations = [...formattedConversations];
  for (const dc of matchingDemoConvs) {
    if (!allConversations.some((c) => c.id === dc.id)) {
      allConversations.push(dc);
    }
  }

  return (
    <MessagesHub
      currentUserId={user.id!}
      currentUserName={user.name || "Member"}
      conversations={allConversations}
    />
  );
}
