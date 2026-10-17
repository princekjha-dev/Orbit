"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string | null;
  createdAt: Date;
  senderId: string;
  sender: { id: string; name: string; image: string | null };
  replyToId: string | null;
}

interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; image: string | null };
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  currentUserName: string;
  title: string;
  members: Member[];
  initialMessages: Message[];
}

export function MessageThread({
  conversationId,
  currentUserId,
  currentUserName,
  title,
  members,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    // Optimistic
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 bg-white flex-shrink-0">
        <Link href="/messages" className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600" aria-label="Back to messages">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <Avatar
          src={members.find((m) => m.userId !== currentUserId)?.user.image}
          name={title}
          size="sm"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{title}</p>
          <p className="text-xs text-neutral-500">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" role="log" aria-label="Messages" aria-live="polite">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-neutral-400">No messages yet. Say hello.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.senderId === currentUserId;
          const showAvatar =
            !isOwn && (i === 0 || messages[i - 1].senderId !== msg.senderId);

          return (
            <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
              {!isOwn && (
                <div className="w-7 flex-shrink-0">
                  {showAvatar && (
                    <Avatar src={msg.sender.image} name={msg.sender.name} size="xs" />
                  )}
                </div>
              )}
              <div className={cn("max-w-xs lg:max-w-md xl:max-w-lg", isOwn ? "items-end" : "items-start")}>
                {showAvatar && !isOwn && (
                  <p className="text-xs text-neutral-500 mb-1 ml-1">{msg.sender.name}</p>
                )}
                <div
                  className={cn(
                    "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                    isOwn
                      ? "bg-brand-600 text-white rounded-tr-sm"
                      : "bg-neutral-100 text-neutral-900 rounded-tl-sm"
                  )}
                >
                  {msg.content}
                </div>
                <p className="text-xs text-neutral-400 mt-1 mx-1">
                  {formatRelativeDate(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input */}
      {replyTo && (
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center gap-2">
          <div className="flex-1 text-xs text-neutral-500 truncate">
            Replying to: {replyTo.content}
          </div>
          <button onClick={() => setReplyTo(null)} className="text-xs text-neutral-400 hover:text-neutral-700" aria-label="Cancel reply">
            Cancel
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-neutral-200 bg-white flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          className="flex-1 resize-none bg-neutral-100 rounded-xl px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-32 overflow-y-auto"
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
