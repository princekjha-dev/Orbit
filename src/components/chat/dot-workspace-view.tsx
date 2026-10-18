"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Send,
  Sparkles,
  ShieldCheck,
  Compass,
  FileCheck2,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Mail,
  Search,
  Workflow,
  Cpu,
  RefreshCw,
  BookOpen,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDotAvatar } from "@/lib/avatars";

export type DotId = "atlas" | "scout" | "forge" | "signal" | "avis" | "quill" | "relay";

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

interface DotWorkspaceViewProps {
  dotId: DotId;
  currentUserId: string;
  currentUserName: string;
}

const DOT_CONFIGS: Record<
  DotId,
  {
    name: string;
    role: string;
    description: string;
    accentColor: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    quickWorkflows: { label: string; prompt: string }[];
    guardrails: string[];
    authorizedTools: string[];
  }
> = {
  avis: {
    name: "AVIS",
    role: "Trust & Verification Engine",
    description: "Evaluates cryptographic DNS TXT proofs, organization credentials, and homoglyph threats. AI never assigns VERIFIED autonomously.",
    accentColor: "#0071E3",
    icon: ShieldCheck,
    quickWorkflows: [
      {
        label: "Check Organization Verification",
        prompt: "Verify the credentials and verification status of Astra Digital Technologies.",
      },
      {
        label: "Inspect Domain TXT Record",
        prompt: "Explain how AVIS enforces DNS TXT verification token checks.",
      },
      {
        label: "Audit Impersonation Defense",
        prompt: "Check for look-alike homoglyph attempts against verified domains.",
      },
    ],
    guardrails: [
      "AI never sets VERIFIED status directly",
      "DNS TXT or verified human reviewer required",
      "Private evidence proofs remain closed by default",
    ],
    authorizedTools: ["toolSearchOrganizations", "dnsTxtVerifier", "auditLogInspector"],
  },
  scout: {
    name: "SCOUT",
    role: "Discovery, Matching & Teams",
    description: "Executes the 5-signal deterministic formula (35% skills, 25% availability, 20% interest, 10% timezone, 10% evidence) without algorithmic bias.",
    accentColor: "#34C759",
    icon: Compass,
    quickWorkflows: [
      {
        label: "Find Verified Opportunities",
        prompt: "Search for engineering and product opportunities available on Orbit.",
      },
      {
        label: "Find Upcoming Tech Events",
        prompt: "Search for upcoming hackathons and engineering summits.",
      },
      {
        label: "Draft Outreach Email",
        prompt: "Draft a concise, professional cold email to the hiring manager for the Full-Stack Systems Engineer role.",
      },
    ],
    guardrails: [
      "Deterministic 5-signal weighted formula",
      "Hard eligibility constraints applied first",
      "Closed workspace until invite accepted",
    ],
    authorizedTools: ["toolSearchOpportunities", "toolSearchEvents", "toolDraftColdEmail", "toolGetApplications"],
  },
  quill: {
    name: "QUILL",
    role: "Skills, Assessments & Evidence",
    description: "Evaluates practical proof-of-work tasks against ESCO taxonomy rubrics and generates SHA-256 evidence records.",
    accentColor: "#FF9500",
    icon: FileCheck2,
    quickWorkflows: [
      {
        label: "Review Assessment Rubric",
        prompt: "What rubric standards does Quill use to evaluate architecture deliverables?",
      },
      {
        label: "Generate Skill Verification Task",
        prompt: "Describe an artifact assessment task for React and Next.js systems architecture.",
      },
      {
        label: "Explain SHA-256 Proof Hashing",
        prompt: "How does Orbit ensure work evidence cannot be tampered with after review?",
      },
    ],
    guardrails: [
      "No arbitrary server-side code execution",
      "Substrings must cite exact deliverable quotes",
      "Tokens revocable by candidate at any time",
    ],
    authorizedTools: ["toolVerifyDeliverable", "toolGenerateAssessment", "toolHashEvidence"],
  },
  relay: {
    name: "RELAY",
    role: "Safe Messaging & Collaboration",
    description: "Deterministic 7-step message router with quarantine safety, PII protection, and verified Community Notes.",
    accentColor: "#5856D6",
    icon: MessageSquare,
    quickWorkflows: [
      {
        label: "Audit Communication Safety",
        prompt: "How does Relay handle off-platform contact attempts and user safety?",
      },
      {
        label: "Explain 7-Step Message Router",
        prompt: "List the deterministic priority order used by Relay to route messages.",
      },
      {
        label: "Draft Community Note Guidelines",
        prompt: "What evidence sources are required to attach a community note to an opportunity?",
      },
    ],
    guardrails: [
      "Never silently delete held quarantine messages",
      "Recipient holds sovereign unquarantine rights",
      "Community notes must cite verified sources",
    ],
    authorizedTools: ["toolCheckMessageSafety", "toolRouteMessage", "toolInspectQuarantine"],
  },
  atlas: {
    name: "ATLAS",
    role: "Research & Knowledge Engine",
    description: "Evaluates empirical research, architectural precedents, and academic methodologies without hallucinating sources or citations.",
    accentColor: "#0071E3",
    icon: BookOpen,
    quickWorkflows: [
      {
        label: "Investigate Technical Precedents",
        prompt: "Search for existing research and architectural patterns for distributed state synchronization.",
      },
      {
        label: "Find Research Opportunities",
        prompt: "What research labs, fellowships, or deep-tech opportunities are active on Orbit?",
      },
      {
        label: "Draft Research Outreach",
        prompt: "Draft a research inquiry to Apex Systems Labs proposing collaboration on consensus protocols.",
      },
    ],
    guardrails: [
      "Never fabricate citations, authors, or research papers",
      "Outreach drafting requires explicit human confirmation before sending",
      "All findings must be grounded in verifiable technical facts",
    ],
    authorizedTools: ["searchOpportunities", "searchOrganizations", "draftColdEmail", "confirmAndSendEmail"],
  },
  forge: {
    name: "FORGE",
    role: "Founder & Venture Engine",
    description: "Accelerates technical founders through thesis stress-testing, milestone architecture, and high-signal co-founder & mentor discovery.",
    accentColor: "#FF9500",
    icon: Rocket,
    quickWorkflows: [
      {
        label: "Structure Startup Milestones",
        prompt: "Help me break down my startup spec into verifiable 2-week deliverables.",
      },
      {
        label: "Discover Domain Advisors",
        prompt: "Find verified mentors and technical advisors specializing in cloud infrastructure.",
      },
      {
        label: "Draft Founder Outreach",
        prompt: "Draft an introductory note to prospective mentors highlighting our proof-of-work traction.",
      },
    ],
    guardrails: [
      "Never fabricate mentors, investors, or company credentials",
      "Human confirmation mandatory before sending any external message",
      "Emphasize proof-of-work deliverables over promotional speculation",
    ],
    authorizedTools: ["searchOpportunities", "searchOrganizations", "draftColdEmail", "confirmAndSendEmail"],
  },
  signal: {
    name: "SIGNAL",
    role: "Talent & Recruiting Engine",
    description: "Evaluates candidates by observable proof-of-work deliverables rather than keyword-stuffed resumes. No mass spam or automated contact.",
    accentColor: "#34C759",
    icon: Search,
    quickWorkflows: [
      {
        label: "Find Verified Engineers",
        prompt: "Discover top-performing talent with verified TypeScript and Next.js deliverables.",
      },
      {
        label: "Review Applicant Deliverables",
        prompt: "Show me recent project applications and their verified artifact submissions.",
      },
      {
        label: "Draft Personalized Candidate Note",
        prompt: "Draft a respectful inquiry to a shortlisted frontend engineer for our open role.",
      },
    ],
    guardrails: [
      "AI never contacts candidates automatically",
      "Recruiter must manually review and confirm outreach before sending",
      "Evaluations are strictly meritocratic and evidence-based",
    ],
    authorizedTools: ["searchOpportunities", "getApplications", "draftColdEmail", "confirmAndSendEmail"],
  },
};

export function DotWorkspaceView({
  dotId,
  currentUserId,
  currentUserName,
}: DotWorkspaceViewProps) {
  const [selectedDot, setSelectedDot] = useState<DotId>(dotId);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<any | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const config = DOT_CONFIGS[selectedDot];
  const Icon = config.icon;

  // Load chat history
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/dots/${selectedDot}/history`);
        const json = await res.json();
        if (json.success && json.data?.history) {
          setMessages(json.data.history);
        }
      } catch {
        // Fallback
      }
    }
    loadHistory();
  }, [selectedDot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: StoredMessage = {
      id: `user-${Date.now()}`,
      dotId: selectedDot,
      sender: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/dots/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dotId: selectedDot,
          message: textToSend,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const dotMsg: StoredMessage = {
          id: `dot-${Date.now()}`,
          dotId: selectedDot,
          sender: "dot",
          content: data.data.reply,
          timestamp: new Date().toISOString(),
          actionResult: data.data.toolResult
            ? {
                action: data.data.toolResult.action,
                success: data.data.toolResult.success,
                data: data.data.toolResult.data,
                links: data.data.toolResult.links,
              }
            : undefined,
        };

        if (
          data.data.toolResult?.action === "toolDraftColdEmail" &&
          data.data.toolResult.success &&
          data.data.toolResult.data?.pendingConfirmation
        ) {
          setPendingConfirmation({
            action: "toolConfirmAndSendEmail",
            payload: data.data.toolResult.data,
          });
        }

        setMessages((prev) => [...prev, dotMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            dotId: selectedDot,
            sender: "dot",
            content: `I encountered an issue: ${data.error?.message || "Failed to process request."}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          dotId: selectedDot,
          sender: "dot",
          content: "Connection to Dot service failed. Please check your network and try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (confirmed: boolean) => {
    if (!pendingConfirmation) return;
    setLoading(true);

    try {
      const res = await fetch("/api/dots/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dotId: selectedDot,
          message: confirmed ? "Confirm action" : "Cancel action",
          confirmationAction: {
            action: pendingConfirmation.action,
            payload: pendingConfirmation.payload,
            confirmed,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `dot-conf-${Date.now()}`,
            dotId: selectedDot,
            sender: "dot",
            content: data.data.reply,
            timestamp: new Date().toISOString(),
            actionResult: data.data.toolResult,
          },
        ]);
      }
    } finally {
      setPendingConfirmation(null);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)] overflow-hidden bg-[#FFFFFF]">
      {/* Middle/Main Workspace: Chat & Workflow Execution */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#E5E5EA] bg-[#F5F5F7]">
        {/* Workspace Top Bar & Dot Selector */}
        <div className="h-14 px-4 sm:px-6 bg-white border-b border-[#E5E5EA] flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(["atlas", "scout", "forge", "signal", "avis", "quill", "relay"] as DotId[]).map((id) => {
              const d = DOT_CONFIGS[id];
              const isSelected = selectedDot === id;
              const DIcon = d.icon;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedDot(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                    isSelected
                      ? "bg-[#1D1D1F] text-white shadow-2xs"
                      : "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getDotAvatar(id)}
                    alt={d.name}
                    className="h-3.5 w-3.5 rounded-full object-cover"
                  />
                  <span>{d.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E8F8EE] text-[#1D7F3E] border border-[#C1EAD0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] animate-pulse" />
              Online & Guarded
            </span>
            <button
              onClick={() => setSidePanelOpen(!sidePanelOpen)}
              className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] px-2 py-1 rounded-md hover:bg-[#F5F5F7] transition-colors"
            >
              {sidePanelOpen ? "Hide Details" : "Show Details"}
            </button>
          </div>
        </div>

        {/* Quick Launch Workflows */}
        <div className="px-4 sm:px-6 py-2.5 bg-white/70 border-b border-[#E5E5EA] flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] flex items-center gap-1 flex-shrink-0">
            <Workflow className="h-3 w-3" /> Quick Workflows:
          </span>
          {config.quickWorkflows.map((wf, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(wf.prompt)}
              disabled={loading}
              className="text-[12px] px-2.5 py-1 rounded-md bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5EA] border border-[#E5E5EA] whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {wf.label}
            </button>
          ))}
        </div>

        {/* Message Log & Workspace Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto py-12 text-center space-y-4">
              <div
                className="h-14 w-14 rounded-2xl mx-auto overflow-hidden flex items-center justify-center shadow-xs border border-[#E5E5EA]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getDotAvatar(selectedDot)}
                  alt={config.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
                  {config.name} Workspace
                </h3>
                <p className="text-[13.5px] text-[#6E6E73] mt-1">
                  {config.description}
                </p>
              </div>
              <p className="text-xs text-[#86868B]">
                Select a quick workflow above or ask a targeted question below.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-2xl",
                  msg.sender === "user" ? "ml-auto justify-end" : "mr-auto"
                )}
              >
                {msg.sender === "dot" && (
                  <div
                    className="h-7 w-7 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs border border-[#E5E5EA]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getDotAvatar(selectedDot)}
                      alt={config.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-[14px] leading-relaxed",
                      msg.sender === "user"
                        ? "bg-[#0071E3] text-white rounded-br-xs"
                        : "bg-white text-[#1D1D1F] border border-[#E5E5EA] shadow-2xs rounded-bl-xs"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Render Grounded Tool Result when present */}
                  {msg.actionResult && (
                    <div className="p-3 rounded-xl border border-[#B9DCFF]/70 bg-[#F0F7FF] text-xs space-y-2">
                      <div className="flex items-center justify-between text-[#0071E3] font-semibold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Tool Executed: {msg.actionResult.action}
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-wide px-1.5 py-0.5 rounded bg-white">
                          Success
                        </span>
                      </div>

                      {msg.actionResult.links && msg.actionResult.links.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-2">
                          {msg.actionResult.links.map((link, idx) => (
                            <Link
                              key={idx}
                              href={link.href}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#B9DCFF] text-[#0071E3] font-medium hover:underline text-[11.5px]"
                            >
                              <span>{link.title}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#86868B] p-2 animate-fade-in">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#0071E3]" />
              <span>{config.name} is running authorized tools...</span>
            </div>
          )}

          {pendingConfirmation && (
            <div className="p-4 rounded-xl border border-[#FF9500]/40 bg-[#FFF7EB] space-y-3 animate-slide-up max-w-lg">
              <div className="flex items-center gap-2 text-[#9A6300] font-semibold text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>Confirmation Required: Send Cold Outreach Email</span>
              </div>
              <p className="text-xs text-[#6E6E73]">
                SCOUT has prepared the email draft. You must explicitly approve before any outbound transmission occurs.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleConfirmAction(true)}
                >
                  Approve & Send
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleConfirmAction(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Composer */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E5E5EA]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Instruct ${config.name} (e.g. search opportunities, inspect credentials, draft note)...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-[13.5px] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white transition-all outline-hidden"
              disabled={loading}
            />
            <Button
              type="submit"
              size="md"
              variant="primary"
              disabled={!input.trim() || loading}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Contextual Panel: Guardrails, Tools, Capabilities */}
      {sidePanelOpen && (
        <aside className="w-full lg:w-80 bg-white p-5 border-t lg:border-t-0 lg:border-l border-[#E5E5EA] overflow-y-auto space-y-6 flex-shrink-0">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
              Active Coworker
            </span>
            <div className="flex items-center gap-2.5 mt-2">
              <div
                className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center border border-[#E5E5EA] flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getDotAvatar(selectedDot)}
                  alt={config.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-[#1D1D1F]">
                  {config.name}
                </h4>
                <p className="text-xs text-[#6E6E73]">{config.role}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#34C759]" /> Bound Guardrails
            </span>
            <ul className="space-y-1.5 text-[12px] text-[#48484A]">
              {config.guardrails.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#34C759] font-bold">✓</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-[#0071E3]" /> Authorized Tools
            </span>
            <div className="flex flex-wrap gap-1.5">
              {config.authorizedTools.map((tool) => (
                <span
                  key={tool}
                  className="text-[11px] px-2 py-0.5 rounded bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA] font-mono"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0F0F2] text-[11.5px] text-[#86868B] space-y-1">
            <p className="font-semibold text-[#1D1D1F]">Execution Transparency</p>
            <p>
              Tool invocations require real parameters and execute deterministically against the Orbit database. Fake statistics and simulated achievements are strictly prohibited.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}
