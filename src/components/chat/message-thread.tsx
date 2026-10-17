"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Send,
  Search,
  Pin,
  Reply,
  CheckCircle,
  Briefcase,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, cn } from "@/lib/utils";
import { subscribeToConversation } from "@/lib/supabase/realtime";

interface Message {
  id: string;
  content: string | null;
  createdAt: Date;
  senderId: string;
  sender: { id: string; name: string; image: string | null };
  replyToId: string | null;
  attachmentUrl?: string | null;
  isPinned?: boolean;
}

interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; username?: string; image: string | null };
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  currentUserName: string;
  title: string;
  members: Member[];
  initialMessages: Message[];
  contextBadge?: {
    type: "PROJECT" | "HACKATHON" | "STARTUP";
    title: string;
    link: string;
    deadline?: string;
  };
}

export function MessageThread({
  conversationId,
  currentUserId,
  currentUserName,
  title,
  members,
  initialMessages,
  contextBadge,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const unsubscribe = subscribeToConversation(conversationId, (incoming) => {
      if (incoming.senderId !== currentUserId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          const memberUser = members.find((m) => m.userId === incoming.senderId)?.user;
          return [
            ...prev,
            {
              id: incoming.id,
              content: incoming.content,
              createdAt: new Date(incoming.createdAt),
              senderId: incoming.senderId,
              sender: memberUser || {
                id: incoming.senderId,
                name: "Participant",
                image: null,
              },
              replyToId: null,
            },
          ];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, currentUserId, members]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.content?.toLowerCase().includes(q) ||
        m.sender.name.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      content,
      createdAt: new Date(),
      senderId: currentUserId,
      sender: { id: currentUserId, name: currentUserName, image: null },
      replyToId: replyTo?.id || null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setReplyTo(null);

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, replyToId: replyTo?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? { ...optimistic, id: data.id } : m))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const otherMember = members.find((m) => m.userId !== currentUserId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/messages"
            className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600"
            aria-label="Back to messages"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Avatar
            src={otherMember?.user.image}
            name={title}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{title}</p>
            <p className="text-[11px] text-neutral-500">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Right Header Actions: Search toggle */}
        <div className="flex items-center gap-2">
          {isSearching ? (
            <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="text-xs bg-transparent focus:outline-none w-32 sm:w-48 text-neutral-800"
              />
              <button
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery("");
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearching(true)}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              title="Search conversation"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Context Badge (e.g. Project Deliverable or Hackathon) */}
      {contextBadge && (
        <div className="px-4 py-2 bg-brand-50/50 border-b border-brand-100 flex items-center justify-between text-xs text-brand-900">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <Briefcase className="h-3.5 w-3.5 text-brand-600" />
            Context: {contextBadge.title}
            {contextBadge.deadline && (
              <span className="text-neutral-500 font-normal">
                (Deadline: {contextBadge.deadline})
              </span>
            )}
          </span>
          <Link
            href={contextBadge.link}
            className="text-brand-700 font-semibold hover:underline flex items-center gap-1 shrink-0"
          >
            Open Context
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="px-4 py-2 bg-amber-50/60 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <Pin className="h-3.5 w-3.5 text-amber-600" />
            Pinned: {pinnedMessage.content}
          </span>
          <button
            onClick={() => setPinnedMessage(null)}
            className="text-amber-600 hover:text-amber-800 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Feed */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        role="log"
        aria-label="Messages"
        aria-live="polite"
      >
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-neutral-400">
              {searchQuery ? "No messages matching search." : "No messages yet. Say hello."}
            </p>
          </div>
        )}

        {filteredMessages.map((msg, i) => {
          const isOwn = msg.senderId === currentUserId;
          const showAvatar =
            !isOwn && (i === 0 || filteredMessages[i - 1].senderId !== msg.senderId);

          return (
            <div
              key={msg.id}
              className={cn("group flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
            >
              {!isOwn && (
                <div className="w-7 flex-shrink-0">
                  {showAvatar && (
                    <Avatar src={msg.sender.image} name={msg.sender.name} size="xs" />
                  )}
                </div>
              )}

              <div
                className={cn(
                  "max-w-xs lg:max-w-md xl:max-w-lg",
                  isOwn ? "items-end" : "items-start"
                )}
              >
                {showAvatar && !isOwn && (
                  <p className="text-xs text-neutral-500 mb-1 ml-1">{msg.sender.name}</p>
                )}

                <div className="relative group flex items-center gap-1.5">
                  <div
                    className={cn(
                      "px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed",
                      isOwn
                        ? "bg-brand-600 text-white rounded-tr-sm"
                        : "bg-neutral-100 text-neutral-900 rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Actions (Reply, Pin) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-100"
                      title="Reply"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setPinnedMessage(msg)}
                      className="p-1 text-neutral-400 hover:text-amber-600 rounded hover:bg-neutral-100"
                      title="Pin message"
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-400 mt-1 mx-1">
                  {formatRelativeDate(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Reply Banner */}
      {replyTo && (
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
          <div className="truncate">
            <span className="font-semibold text-neutral-900">
              Replying to {replyTo.sender.name}:
            </span>{" "}
            {replyTo.content}
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-xs text-neutral-400 hover:text-neutral-700 ml-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-neutral-200 bg-white flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Press Enter to send)"
          rows={1}
          className="flex-1 resize-none bg-neutral-100 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-32 overflow-y-auto"
          aria-label="Message input"
          style={{ minHeight: "2.5rem" }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
