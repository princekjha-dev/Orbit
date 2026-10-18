import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { DotChatView } from "@/components/chat/dot-chat-view";
import { getDotAvatar } from "@/lib/avatars";
import {
  ShieldCheck,
  Compass,
  FileCheck2,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Globe,
  Award,
  Sparkles,
  Users,
  Briefcase,
} from "lucide-react";

export default async function OrbitModHomePage() {
  const user = await getCurrentUser();

  // Load live data safely with graceful fallback
  let spacesCount = 0;
  let oppsCount = 0;
  let openTeamsCount = 0;
  let verifiedOrgsCount = 0;

  try {
    const [cCount, oCount, orgCount] = await Promise.all([
      prisma.community.count(),
      prisma.opportunity.count({ where: { isActive: true } }),
      prisma.organization.count({ where: { verificationStatus: "VERIFIED" } }),
    ]);
    spacesCount = cCount;
    oppsCount = oCount;
    verifiedOrgsCount = orgCount;
  } catch {
    // Database offline fallback values (realistic demo figures)
    spacesCount = 4;
    oppsCount = 8;
    verifiedOrgsCount = 3;
  }

  const DOTS = [
    {
      id: "avis",
      name: "AVIS",
      title: "Trust & Verification",
      question: "Can I trust this person, organisation, or opportunity?",
      desc: "Collects and explains factual verification evidence. Features DNS TXT challenges, homoglyph look-alike detection, safe upload inspection, and human reviewer queues.",
      href: "/mod/avis",
      icon: ShieldCheck,
      color: "from-blue-600 to-cyan-600",
      accent: "text-blue-600",
      bgLight: "bg-blue-50/70 border-blue-200/70",
      status: "Active & Guarded",
      rules: ["AI never sets VERIFIED", "DNS TXT or human approval only", "Default deny on private proof"],
    },
    {
      id: "scout",
      name: "SCOUT",
      title: "Discovery, Matching & Teams",
      question: "What opportunity or person should I connect with?",
      desc: "Scores observable signals using a deterministic formula (35% skills, 25% availability, 20% interest, 10% timezone, 10% evidence). Builds complement-driven teams without bias.",
      href: "/mod/scout",
      icon: Compass,
      color: "from-emerald-600 to-teal-600",
      accent: "text-emerald-600",
      bgLight: "bg-emerald-50/70 border-emerald-200/70",
      status: "5-Signal Formula Active",
      rules: ["Divergent skill weighting", "Hard filters applied first", "Closed workspace until invite accepted"],
    },
    {
      id: "quill",
      name: "QUILL",
      title: "Skills, Assessments & Evidence",
      question: "Can this person actually prove what they can do?",
      desc: "Practical proof-of-work assessment engine. Candidate completes artifact task with server-side time enforcement, AI advisory review with substring quote verification, and revocable evidence.",
      href: "/mod/quill",
      icon: FileCheck2,
      color: "from-amber-600 to-orange-600",
      accent: "text-amber-600",
      bgLight: "bg-amber-50/70 border-amber-200/70",
      status: "Artifact Tasks Ready",
      rules: ["No arbitrary code execution", "Exact quote validation required", "Revocable token sharing"],
    },
    {
      id: "relay",
      name: "RELAY",
      title: "Community, Messaging, Safety & Notes",
      question: "How do people communicate and collaborate safely?",
      desc: "Professional communication layer. Uses 7-step deterministic message routing, quarantine and recipient restore, PII redaction, and evidence-backed Community Notes.",
      href: "/mod/relay",
      icon: MessageCircle,
      color: "from-purple-600 to-indigo-600",
      accent: "text-purple-600",
      bgLight: "bg-purple-50/70 border-purple-200/70",
      status: "Safe Routing Active",
      rules: ["7-step priority order", "Never silently delete held items", "Community notes require cited sources"],
    },
  ];

  const PIPELINE_STEPS = [
    { label: "1. Discover", sub: "Spaces & Opps", icon: Globe },
    { label: "2. Verify", sub: "Avis Trust Engine", icon: ShieldCheck },
    { label: "3. Prove", sub: "Quill Assessment", icon: FileCheck2 },
    { label: "4. Match", sub: "Scout 5-Signal Rank", icon: Compass },
    { label: "5. Collaborate", sub: "Team & Relay Chat", icon: MessageCircle },
    { label: "6. Evidence", sub: "Evidence Passport", icon: Award },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-brand-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-xs border border-white/15">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            <span>OrbitMod V5 Master Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Four Specialized Coworkers. One Seamless Loop.
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            OrbitMod V5 integrates trust verification, transparent matching, real proof of work,
            and safe collaboration into a single end-to-end professional engine.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-neutral-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Deterministic First</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>AI Advisory Only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Resource-Level Access Control</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Sparkles className="h-96 w-96 text-white" />
        </div>
      </div>

      {/* Core Loop Walkthrough Strip */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">The OrbitMod V5 Core Loop</h2>
            <p className="text-xs text-neutral-500">From discovery to verifiable proof in an unbroken chain</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            End-to-End
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="flex flex-col items-center text-center p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 hover:bg-white hover:border-brand-300 hover:shadow-xs transition-all"
              >
                <div className="h-8 w-8 rounded-full bg-brand-100/80 text-brand-700 flex items-center justify-center mb-2">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-neutral-900">{step.label}</span>
                <span className="text-[11px] text-neutral-500 mt-0.5">{step.sub}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* The Four Dots Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">The Four Dots</h2>
          <p className="text-xs text-neutral-500">
            Independent, highly-focused modules operating over shared product data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOTS.map((dot) => {
            const Icon = dot.icon;
            return (
              <div
                key={dot.id}
                className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl overflow-hidden border border-neutral-200 shadow-xs flex items-center justify-center flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getDotAvatar(dot.id)}
                          alt={dot.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-neutral-900">{dot.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dot.bgLight} ${dot.accent}`}>
                            Dot
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">{dot.title}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-neutral-400">
                      {dot.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs italic text-neutral-700 font-medium">
                    &ldquo;{dot.question}&rdquo;
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {dot.desc}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Core Safeguards:
                    </span>
                    <ul className="text-[11px] text-neutral-600 space-y-1">
                      {dot.rules.map((rule) => (
                        <li key={rule} className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-neutral-400" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between">
                  <Link
                    href={dot.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    <span>{dot.name} Console</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/messages?dot=${dot.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Chat with {dot.name}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Interactive Dot Workspace Console */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <h2 className="text-base font-bold text-neutral-900">
                Live Interactive Dot Console
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Talk directly with Avis, Scout, Quill, or Relay powered by live Groq model inference.
            </p>
          </div>
          <Link
            href="/messages"
            className="text-xs font-medium text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            <span>Full Messenger</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50/50">
          <DotChatView
            currentUserId={user?.id || "demo-talent"}
            currentUserName={(user as any)?.name || "Builder"}
          />
        </div>
      </section>

      {/* Shared Foundation Capabilities Quick Links */}
      <section className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Shared Capabilities
          </h2>
          <p className="text-xs text-neutral-500">Product surfaces powered by the Four Dots</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/mod/spaces"
            className="p-4 rounded-lg bg-white border border-neutral-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-md bg-blue-50 text-blue-700">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Spaces</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Community channels, verified postings, and discussion threads.
              </p>
            </div>
          </Link>

          <Link
            href="/opportunities"
            className="p-4 rounded-lg bg-white border border-neutral-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-700">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Opportunities</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Verified roles with clear evidence requirements.
              </p>
            </div>
          </Link>

          <Link
            href="/mod/passport"
            className="p-4 rounded-lg bg-white border border-neutral-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-md bg-purple-50 text-purple-700">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Evidence Passport</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Private-by-default skills portfolio with revocable sharing tokens.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
