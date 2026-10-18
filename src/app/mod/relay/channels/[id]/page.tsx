import React from "react";
import Link from "next/link";
import { getChannelMessages } from "@/lib/relay/relay-service";
import { SafeChatClient } from "@/components/relay/safe-chat-client";
import { ArrowLeft, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pod Channel | Relay - OrbitMod V5",
  description: "Monitored safe chat channel with off-platform contact detection.",
};

export default async function ChannelChatPage(
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const messages = await getChannelMessages(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/mod/relay">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5 text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Relay Hub
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800">
            TEAM POD CHANNEL
          </span>
          <span className="text-xs text-neutral-500 font-mono">Channel ID: {id}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Safe Collaboration Channel
        </h1>
        <p className="text-xs text-neutral-600 max-w-2xl">
          Direct communication monitored for off-platform contact risks, wire solicitations, and impersonation attempts.
        </p>
      </div>

      <SafeChatClient
        channelId={id}
        initialMessages={messages}
        currentUserId="candidate-alex-chen"
        currentUserName="Alex Chen (DEMO / simulated)"
      />
    </div>
  );
}
