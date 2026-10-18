"use client";

import React, { useState } from "react";
import { ChatMessageData } from "@/lib/relay/relay-service";
import { detectOffPlatformSolicitation } from "@/lib/relay/relay-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AlertTriangle, ShieldCheck, Clock, User } from "lucide-react";

interface SafeChatClientProps {
  channelId: string;
  initialMessages: ChatMessageData[];
  currentUserId: string;
  currentUserName: string;
}

export function SafeChatClient({
  channelId,
  initialMessages,
  currentUserId,
  currentUserName,
}: SafeChatClientProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live pre-send check for real-time safety feedback
  const liveCheck = detectOffPlatformSolicitation(inputText);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orbitmod/relay/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          content: inputText.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      const newMsg: ChatMessageData = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-xs flex flex-col h-[600px]">
      {/* Channel Header */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-neutral-900">Pod Channel: {channelId}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Safety Monitored</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-neutral-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-500">
            No messages yet. Begin team collaboration here.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <User className="w-3 h-3" />
                  <span className="font-semibold text-neutral-700">{msg.senderName}</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                <div
                  className={`max-w-md p-3 rounded-xl text-xs ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-xs"
                      : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-xs shadow-2xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Inline Safety Warning if detected */}
                {msg.safetyCheck.hasOffPlatformRisk && (
                  <div className="max-w-md p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-[11px] text-amber-900 flex items-start gap-2 shadow-2xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-950">Safety Risk Indicator</div>
                      <p className="text-amber-800 mt-0.5">{msg.safetyCheck.warningMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Live typing warning */}
      {liveCheck.hasOffPlatformRisk && (
        <div className="px-4 py-2 border-t border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Notice: Message mentions external contact channels ({liveCheck.detectedPatterns.join(", ")}).</span>
        </div>
      )}

      {errorMsg && (
        <div className="px-4 py-2 border-t border-red-200 bg-red-50 text-xs text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Collaborate securely on-platform..."
          disabled={sending}
          className="text-xs"
        />
        <Button size="sm" type="submit" disabled={sending || !inputText.trim()} className="h-9 px-4">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}
