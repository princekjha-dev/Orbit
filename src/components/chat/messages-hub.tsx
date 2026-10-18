"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Users,
  Sparkles,
  Plus,
  Search,
  ShieldCheck,
  Compass,
  FileCheck2,
  Lock,
  ArrowRight,
  FolderKanban,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeDate, cn } from "@/lib/utils";
import { getDotAvatar } from "@/lib/avatars";
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog";

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
  const [activeFilter, setActiveFilter] = useState<"all" | "dms" | "groups" | "dots">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const DOTS = [
    {
      id: "avis",
      name: "AVIS",
      role: "Trust & Verification Engine",
      lastMsg: "Safe upload inspection and DNS TXT verification ready.",
      icon: ShieldCheck,
      color: "#0071E3",
    },
    {
      id: "scout",
      name: "SCOUT",
      role: "5-Signal Matching",
      lastMsg: "5 opportunity matches scored with >85% skill alignment.",
      icon: Compass,
      color: "#34C759",
    },
    {
      id: "quill",
      name: "QUILL",
      role: "Skills & Evidence",
      lastMsg: "Artifact assessment task review completed.",
      icon: FileCheck2,
      color: "#FF9500",
    },
    {
      id: "relay",
      name: "RELAY",
      role: "Safe Communication Router",
      lastMsg: "7-step message router active with quarantine safeguards.",
      icon: MessageSquare,
      color: "#5856D6",
    },
  ];

  const filteredConversations = conversations.filter((c) => {
    if (activeFilter === "dms" && c.isGroup) return false;
    if (activeFilter === "groups" && !c.isGroup) return false;
    if (activeFilter === "dots") return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.displayName.toLowerCase().includes(q) ||
        (c.lastMsg?.content && c.lastMsg.content.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-56px)] bg-white overflow-hidden">
      {/* Column 2: Conversations List (approx 340-380px) */}
      <div className="w-full sm:w-88 lg:w-96 border-r border-[#E5E5EA] flex flex-col bg-white flex-shrink-0">
        {/* List Header */}
        <div className="p-4 border-b border-[#F0F0F2] space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
              Messages
            </h1>
            <NewConversationDialog currentUserId={currentUserId} />
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-[13px] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: "all", label: "All" },
              { id: "dms", label: "Direct" },
              { id: "groups", label: "Groups" },
              { id: "dots", label: "Dots" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  activeFilter === tab.id
                    ? "bg-[#1D1D1F] text-white"
                    : "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F0F0F2]">
          {/* Coworker Dots Section (if tab is all or dots) */}
          {(activeFilter === "all" || activeFilter === "dots") && (
            <div>
              <p className="px-4 py-2 text-[10.5px] font-semibold tracking-wider uppercase text-[#86868B] bg-[#F5F5F7]/60">
                Coworker Dots
              </p>
              {DOTS.map((dot) => {
                const DIcon = dot.icon;
                return (
                  <Link
                    key={dot.id}
                    href={`/dots/${dot.id}`}
                    className="flex items-center gap-3 p-3.5 hover:bg-[#F5F5F7] transition-colors group"
                  >
                    <div
                      className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-[#E5E5EA] shadow-2xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getDotAvatar(dot.id)}
                        alt={dot.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13.5px] font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                          {dot.name}
                        </span>
                        <span className="text-[10.5px] text-[#86868B]">Online</span>
                      </div>
                      <p className="text-[12px] text-[#6E6E73] truncate mt-0.5">
                        {dot.lastMsg}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Direct & Group Conversations */}
          {activeFilter !== "dots" && (
            <div>
              <p className="px-4 py-2 text-[10.5px] font-semibold tracking-wider uppercase text-[#86868B] bg-[#F5F5F7]/60">
                Conversations
              </p>
              {filteredConversations.length > 0 ? (
                filteredConversations.map((c) => (
                  <Link
                    key={c.id}
                    href={`/messages/${c.id}`}
                    className="flex items-center gap-3 p-3.5 hover:bg-[#F5F5F7] transition-colors group"
                  >
                    <Avatar
                      src={c.displayImage}
                      name={c.displayName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13.5px] font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors truncate">
                          {c.displayName}
                        </span>
                        {c.lastMsg?.createdAt && (
                          <span className="text-[11px] text-[#86868B] flex-shrink-0">
                            {formatRelativeDate(c.lastMsg.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#6E6E73] truncate mt-0.5">
                        {c.lastMsg?.content || "No messages yet"}
                      </p>
                    </div>
                    {c.isUnread && (
                      <span className="h-2 w-2 rounded-full bg-[#0071E3] flex-shrink-0" />
                    )}
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#86868B]">
                  No active conversations found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Active Conversation Canvas (Empty state on base /messages) */}
      <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#F5F5F7]">
        <div className="max-w-md space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-white border border-[#E5E5EA] flex items-center justify-center mx-auto shadow-2xs text-[#0071E3]">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
              Select a conversation
            </h2>
            <p className="text-[13.5px] text-[#6E6E73] mt-1">
              Choose a team member, private project channel, or launch one of your Four Coworker Dots to begin collaborating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
