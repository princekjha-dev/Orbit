import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRelativeDate } from "@/lib/utils";
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireAuth();

  const conversations = await prisma.conversationMember.findMany({
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
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>
        <NewConversationDialog currentUserId={user.id!} />
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare />}
          title="No conversations yet"
          description="Start a direct message with someone you are working with"
        />
      ) : (
        <div className="space-y-1">
          {conversations.map(({ conversation, lastReadAt }) => {
            const otherMembers = conversation.members.filter((m) => m.userId !== user.id);
            const lastMsg = conversation.messages[0];
            const isUnread = lastMsg && lastReadAt && new Date(lastMsg.createdAt) > new Date(lastReadAt);
            const displayName = conversation.isGroup
              ? conversation.name || otherMembers.map((m) => m.user.name).join(", ")
              : otherMembers[0]?.user.name || "Unknown";
            const displayImage = conversation.isGroup ? null : otherMembers[0]?.user.image;

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <Avatar src={displayImage} name={displayName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${isUnread ? "font-semibold text-neutral-900" : "font-medium text-neutral-700"}`}>
                      {displayName}
                    </p>
                    {lastMsg && (
                      <p className="text-xs text-neutral-400 flex-shrink-0">
                        {formatRelativeDate(lastMsg.createdAt)}
                      </p>
                    )}
                  </div>
                  {lastMsg && (
                    <p className={`text-xs truncate ${isUnread ? "text-neutral-700 font-medium" : "text-neutral-400"}`}>
                      {lastMsg.content || "Attachment"}
                    </p>
                  )}
                </div>
                {isUnread && (
                  <div className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" aria-label="Unread message" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
