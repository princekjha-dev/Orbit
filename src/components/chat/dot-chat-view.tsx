"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Check, X, Mail, ExternalLink, ShieldCheck, Compass, Award, MessageSquare } from "lucide-react";
import { DOT_METADATA, DotId } from "@/lib/ai/dot-agent";
import Link from "next/link";

interface StoredMessage {
  id: string;
  dotId: DotId;
  sender: "user" | "dot";
  content: string;
  timestamp: string;
  actionResult?: {
    action: string;
    success: boolean;
    data?: any;
    links?: Array<{ title: string; href: string }>;
  };
}

interface DotChatViewProps {
  initialDotId?: DotId;
  currentUserId: string;
  currentUserName: string;
}

export function DotChatView({
  initialDotId = "scout",
  currentUserId,
  currentUserName,
}: DotChatViewProps) {
  const [selectedDot, setSelectedDot] = useState<DotId>(initialDotId);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<any | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const dot = DOT_METADATA[selectedDot];

  // Load history when dot changes
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/dots/${selectedDot}/history`);
        const json = await res.json();
        if (json.success && json.data?.history) {
          setMessages(json.data.history);
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadHistory();
  }, [selectedDot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const handleSend = async (textToSend?: string) => {
    const content = textToSend || input.trim();
    if (!content || loading) return;

    setInput("");
    setLoading(true);

    const tempUserMsg: StoredMessage = {
      id: `temp-${Date.now()}`,
      dotId: selectedDot,
      sender: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/dots/${selectedDot}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.history) {
        setMessages(json.data.history);
        if (json.data.toolResult?.requiresConfirmation) {
          setPendingConfirmation(json.data.toolResult.confirmationPayload);
        }
      } else {
        const errorMsg: StoredMessage = {
          id: `err-${Date.now()}`,
          dotId: selectedDot,
          sender: "dot",
          content: json.error?.message || "Failed to process request. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const netError: StoredMessage = {
        id: `net-err-${Date.now()}`,
        dotId: selectedDot,
        sender: "dot",
        content: "Network error communicating with Dot. Please verify connection.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, netError]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (confirmed: boolean) => {
    if (!pendingConfirmation) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/dots/${selectedDot}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: confirmed ? "Confirmed, proceed with sending." : "Cancel email dispatch.",
          confirmationAction: {
            action: "confirmAndSendEmail",
            payload: pendingConfirmation,
            confirmed,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.history) {
        setMessages(json.data.history);
      }
    } catch {
      // Error handling
    } finally {
      setPendingConfirmation(null);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      {/* Dot Selector Tabs */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/70 p-1.5 gap-1.5 overflow-x-auto">
        {(["avis", "scout", "quill", "relay"] as DotId[]).map((id) => {
          const d = DOT_METADATA[id];
          const active = selectedDot === id;
          return (
            <button
              key={id}
              onClick={() => {
                setSelectedDot(id);
                setPendingConfirmation(null);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? "bg-white text-neutral-900 shadow-xs border border-neutral-200"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              <div
                className={`h-2.5 w-2.5 rounded-full bg-gradient-to-tr ${d.avatarColor}`}
              />
              <span>{d.name}</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                DOT {d.dotNumber}
              </span>
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${dot.avatarColor} flex items-center justify-center text-white shadow-xs`}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900">{dot.name}</h2>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                DOT {dot.dotNumber}
              </span>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1">{dot.tagline}</p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-neutral-50/30">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? "bg-neutral-900 text-white rounded-br-xs"
                    : "bg-white text-neutral-800 border border-neutral-200 shadow-xs rounded-bl-xs"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Render Rich Action Links if any */}
                {msg.actionResult?.links && msg.actionResult.links.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5">
                    <span className="text-[11px] font-semibold text-neutral-500 block uppercase tracking-wider">
                      Actionable Results & Links:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.actionResult.links.map((link, idx) => (
                        <Link
                          key={idx}
                          href={link.href}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors border border-neutral-200"
                        >
                          <span>{link.title}</span>
                          <ExternalLink className="h-3 w-3 text-neutral-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}

        {/* Pending Confirmation Modal Box (e.g. for Cold Email) */}
        {pendingConfirmation && (
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <Mail className="h-4 w-4 text-amber-700" />
              <span>Mandatory Human Confirmation — Ready to Send Email?</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-200 text-xs space-y-1.5">
              <p>
                <span className="font-semibold text-neutral-700">To:</span>{" "}
                {pendingConfirmation.recipient}
              </p>
              <p>
                <span className="font-semibold text-neutral-700">Subject:</span>{" "}
                {pendingConfirmation.subject}
              </p>
              <div className="border-t border-neutral-100 pt-2 mt-2">
                <p className="whitespace-pre-line text-neutral-600 font-mono text-[11px]">
                  {pendingConfirmation.body}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => handleConfirmAction(false)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAction(true)}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Confirm & Send</span>
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 py-2">
            <div className="h-2 w-2 rounded-full bg-neutral-400 animate-pulse" />
            <span>{dot.name} is executing tools and retrieving real data...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-medium text-neutral-400 flex-shrink-0">
          Try asking:
        </span>
        {selectedDot === "scout" && (
          <>
            <button
              onClick={() => handleSend("Find frontend internships for me")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Find frontend internships&rdquo;
            </button>
            <button
              onClick={() => handleSend("Find companies and draft a cold email to Apex Systems")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Draft a cold email to Apex Systems&rdquo;
            </button>
            <button
              onClick={() => handleSend("Show me my active applications")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Show my applications&rdquo;
            </button>
          </>
        )}
        {selectedDot === "avis" && (
          <>
            <button
              onClick={() => handleSend("Verify domain legitimacy and DNS records")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Verify domain & DNS challenges&rdquo;
            </button>
            <button
              onClick={() => handleSend("Check SLA review queue status")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Check review queue SLA&rdquo;
            </button>
          </>
        )}
        {selectedDot === "quill" && (
          <>
            <button
              onClick={() => handleSend("Review skill assessments and standardized rubrics")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Show assessments & rubrics&rdquo;
            </button>
            <button
              onClick={() => handleSend("How does SHA-256 evidence fingerprinting work?")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Evidence fingerprinting proof&rdquo;
            </button>
          </>
        )}
        {selectedDot === "relay" && (
          <>
            <button
              onClick={() => handleSend("Explain off-platform communication safety rules")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Off-platform safety rules&rdquo;
            </button>
            <button
              onClick={() => handleSend("How do decentralized Community Notes work?")}
              className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex-shrink-0 text-[11px]"
            >
              &ldquo;Community Notes consensus&rdquo;
            </button>
          </>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-3 bg-white border-t border-neutral-200"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${dot.name} (e.g. "Find jobs", "Draft cold email", "Check verification")...`}
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
