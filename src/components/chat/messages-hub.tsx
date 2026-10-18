"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Users, Sparkles, Plus, ArrowRight, ShieldCheck, Compass, Award } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/lib/utils";
import { DotChatView } from "@/components/chat/dot-chat-view";
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog";
import { DOT_METADATA, DotId } from "@/lib/ai/dot-agent";

interface ConversationItem {
  id: string;
  isGroup: boolean;
  name: string | null;
  lastReadAt: Date | null;
  updatedAt: Date;
  displayName: string;
  displayImage: string | null;
  lastMsg?: {
    content: string | null;
    createdAt: Date;
  } | null;
  isUnread?: boolean;
}

interface MessagesHubProps {
  currentUserId: string;
  currentUserName: string;
  conversations: ConversationItem[];
}

export function MessagesHub({
  currentUserId,
  currentUserName,
  conversations,
}: MessagesHubProps) {
  const [activeTab, setActiveTab] = useState<"people" | "groups" | "dots">("dots");
  const [selectedDotId, setSelectedDotId] = useState<DotId>("scout");

  const peopleConvs = conversations.filter((c) => !c.isGroup);
  const groupConvs = conversations.filter((c) => c.isGroup);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Messages</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Connect with team members, private groups, and the Four Coworker Dots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewConversationDialog currentUserId={currentUserId} />
        </div>
      </div>

      {/* Primary Category Navigation */}
      <div className="flex border-b border-neutral-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("dots")}
          className={`flex items-center gap-2 pb-3 relative transition-colors ${
            activeTab === "dots"
              ? "text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Orbit Dots</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
            4 Coworkers
          </span>
        </button>

        <button
          onClick={() => setActiveTab("people")}
          className={`flex items-center gap-2 pb-3 relative transition-colors ${
            activeTab === "people"
              ? "text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>People</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-600">
            {peopleConvs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 pb-3 relative transition-colors ${
            activeTab === "groups"
              ? "text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Groups & Pods</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-600">
            {groupConvs.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "dots" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dot Selector Sidebar */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block px-1">
              Select AI Coworker
            </span>
            {(["avis", "scout", "quill", "relay"] as DotId[]).map((dotId) => {
              const d = DOT_METADATA[dotId];
              const isSelected = selectedDotId === dotId;
              return (
                <button
                  key={dotId}
                  onClick={() => setSelectedDotId(dotId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-900"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-lg bg-gradient-to-tr ${d.avatarColor} flex items-center justify-center text-white flex-shrink-0 shadow-xs`}
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-900">{d.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700">
                        DOT {d.dotNumber}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-neutral-600 mt-0.5 line-clamp-1">
                      {d.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{d.tagline}</p>
                  </div>
                </button>
              );
            })}

            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 mt-4">
              <span className="text-xs font-semibold text-neutral-700 block mb-1">
                Real Action Execution
              </span>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Dots do not merely chat. They search active Orbit opportunities, verify DNS domains, draft human-confirmed cold emails, and audit skills.
              </p>
            </div>
          </div>

          {/* Chat Workspace */}
          <div className="lg:col-span-8 h-[600px]">
            <DotChatView
              initialDotId={selectedDotId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </div>
        </div>
      ) : activeTab === "people" ? (
        peopleConvs.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-12 text-center">
            <MessageSquare className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
            <h2 className="text-sm font-bold text-neutral-900">No Direct Messages Yet</h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Start a direct conversation with coworkers, founders, or applicants you are collaborating with.
            </p>
            <div className="mt-4">
              <NewConversationDialog currentUserId={currentUserId} />
            </div>
          </div>
        ) : (
          <div className="space-y-1 bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
            {peopleConvs.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
              >
                <Avatar src={conv.displayImage} name={conv.displayName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm truncate ${
                        conv.isUnread ? "font-semibold text-neutral-900" : "font-medium text-neutral-700"
                      }`}
                    >
                      {conv.displayName}
                    </p>
                    {conv.lastMsg && (
                      <p className="text-xs text-neutral-400 flex-shrink-0">
                        {formatRelativeDate(conv.lastMsg.createdAt)}
                      </p>
                    )}
                  </div>
                  {conv.lastMsg && (
                    <p
                      className={`text-xs truncate ${
                        conv.isUnread ? "text-neutral-800 font-medium" : "text-neutral-500"
                      }`}
                    >
                      {conv.lastMsg.content || "Attachment"}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : groupConvs.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-12 text-center">
          <Users className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-neutral-900">No Team Pod Channels</h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Group chats and private workspace channels are automatically initialized when team pods form.
          </p>
          <div className="mt-4">
            <Link
              href="/mod/scout/team-builder"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              <span>Build a Team Pod with Scout</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-1 bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
          {groupConvs.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
            >
              <Avatar src={conv.displayImage} name={conv.displayName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm truncate ${
                      conv.isUnread ? "font-semibold text-neutral-900" : "font-medium text-neutral-700"
                    }`}
                  >
                    {conv.displayName}
                  </p>
                  {conv.lastMsg && (
                    <p className="text-xs text-neutral-400 flex-shrink-0">
                      {formatRelativeDate(conv.lastMsg.createdAt)}
                    </p>
                  )}
                </div>
                {conv.lastMsg && (
                  <p
                    className={`text-xs truncate ${
                      conv.isUnread ? "text-neutral-800 font-medium" : "text-neutral-500"
                    }`}
                  >
                    {conv.lastMsg.content || "Attachment"}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
