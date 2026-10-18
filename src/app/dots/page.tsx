import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { FeaturePanel } from "@/components/ui/feature-panel";
import { DotCard } from "@/components/ui/orbit-cards";
import { getDotAvatar } from "@/lib/avatars";
import {
  ShieldCheck,
  Compass,
  FileCheck2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Workflow,
  BookOpen,
  Rocket,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dots",
  description: "Meet your coworker Dots. Specialized digital coworkers for the Orbit ecosystem.",
};

const DOTS = [
  {
    id: "atlas",
    name: "ATLAS",
    role: "Research & Knowledge",
    question: "What is the technical ground truth and verified methodology?",
    description: "Evaluates empirical research, architectural precedents, and academic methodologies without hallucinating sources or citations. Features literature synthesis, specialist discovery, and verified inquiry drafting.",
    capabilities: [
      "Rigorous Empirical Precedent Synthesis",
      "Specialist & Research Lab Matching",
      "Grounded Literature & Citation Verification",
      "Human-Approved Research Outreach Drafting",
    ],
    status: "Knowledge Engine Active",
    icon: BookOpen,
    accentColor: "#0071E3",
    workflows: [
      "Synthesize architecture research",
      "Find domain specialists & research labs",
      "Draft research collaborator outreach",
    ],
  },
  {
    id: "scout",
    name: "SCOUT",
    role: "Career & Opportunity",
    question: "What opportunity or team should I build with?",
    description: "Scores observable signals using a deterministic formula (35% skills, 25% availability, 20% interest, 10% timezone, 10% evidence). Builds complement-driven teams without bias.",
    capabilities: [
      "5-Signal Deterministic Matching",
      "Complementary Team Builder",
      "Automated Outreach & Cold Email Drafting",
      "Opportunity Fit Scoring",
    ],
    status: "5-Signal Formula Active",
    icon: Compass,
    accentColor: "#34C759",
    workflows: [
      "Find top opportunity matches",
      "Draft personalized cold outreach",
      "Assemble balanced hackathon team",
    ],
  },
  {
    id: "forge",
    name: "FORGE",
    role: "Founder & Venture",
    question: "How do you transform a validated technical thesis into an enduring startup?",
    description: "Accelerates technical founders through thesis stress-testing, milestone architecture, and high-signal co-founder, mentor, and partner discovery within verified networks.",
    capabilities: [
      "Startup Thesis & Spec Architecture",
      "Co-founder Complementary Skill Matching",
      "Mentor & Technical Advisor Discovery",
      "Human-Confirmed Founder Outreach",
    ],
    status: "Venture Engine Active",
    icon: Rocket,
    accentColor: "#FF9500",
    workflows: [
      "Structure startup sprint deliverables",
      "Find technical mentors & advisors",
      "Draft outreach to prospective co-founders",
    ],
  },
  {
    id: "signal",
    name: "SIGNAL",
    role: "Talent & Recruiting",
    question: "Who are the highest-signal builders verified by real deliverables?",
    description: "Evaluates candidates by observable proof-of-work deliverables rather than keyword-stuffed resumes. Features rubric matching, pipeline tracking, and personalized candidate drafting.",
    capabilities: [
      "Deliverable-Driven Candidate Evaluation",
      "Proof-of-Work Rubric Matching",
      "High-Signal Candidate Shortlisting",
      "Respectful, Human-Approved Candidate Notes",
    ],
    status: "Talent Engine Active",
    icon: Search,
    accentColor: "#34C759",
    workflows: [
      "Discover verified builders & deliverables",
      "Evaluate candidate artifact submissions",
      "Draft personalized candidate inquiry",
    ],
  },
  {
    id: "avis",
    name: "AVIS",
    role: "Trust & Verification",
    question: "Can I trust this person, organisation, or opportunity?",
    description: "Collects and explains factual verification evidence. Features DNS TXT challenges, homoglyph look-alike detection, safe upload inspection, and human reviewer queues.",
    capabilities: [
      "DNS TXT Challenge Verification",
      "Organization Credential Audit",
      "Homoglyph & Impersonation Defense",
      "Human Reviewer Escalation Queue",
    ],
    status: "Active & Guarded",
    icon: ShieldCheck,
    accentColor: "#0071E3",
    workflows: [
      "Verify organization domain",
      "Inspect credential claim",
      "Analyze URL authenticity",
    ],
  },
  {
    id: "quill",
    name: "QUILL",
    role: "Skills, Assessments & Evidence",
    question: "Can this person actually prove what they can do?",
    description: "Practical proof-of-work assessment engine. Candidate completes artifact task with server-side time enforcement, AI advisory review with substring quote verification, and revocable evidence.",
    capabilities: [
      "ESCO Skill Taxonomy Mapping",
      "Time-Enforced Artifact Assessments",
      "Cryptographic SHA-256 Evidence Hashing",
      "Advisory Review with Quote Validation",
    ],
    status: "Assessment Engine Ready",
    icon: FileCheck2,
    accentColor: "#FF9500",
    workflows: [
      "Generate practical skill assessment",
      "Hash and verify completed deliverable",
      "Export portable evidence passport",
    ],
  },
  {
    id: "relay",
    name: "RELAY",
    role: "Community, Messaging, Safety & Notes",
    question: "How do people communicate and collaborate safely?",
    description: "Professional communication layer. Uses 7-step deterministic message routing, quarantine and recipient restore, PII redaction, and evidence-backed Community Notes.",
    capabilities: [
      "7-Step Deterministic Message Router",
      "Quarantine & Safe Restore",
      "Community Notes with Source Citations",
      "Off-Platform Disintermediation Flags",
    ],
    status: "Safe Routing Guarded",
    icon: MessageCircle,
    accentColor: "#5856D6",
    workflows: [
      "Analyze message safety & PII",
      "Review held quarantine items",
      "Draft cited community note",
    ],
  },
];

export default function DotsIndexPage() {
  return (
    <AppShell>
      <OrbitHeader title="Dots" />

      <div className="atmos-dots min-h-screen px-4 sm:px-6 lg:px-8 py-6 space-y-10 max-w-[1240px] mx-auto w-full">
        {/* Large Editorial Introduction */}
        <PageIntro
          eyebrow="Specialized Digital Coworkers"
          title="Meet your Dots."
          description="Dots are not generic chatbots. Each Dot is a dedicated coworker with specialized capabilities, bounded tools, and audit-logged operations."
        />

        {/* Feature Panel */}
        <FeaturePanel
          theme="neutral"
          eyebrow="The Orbit Coworker Standard"
          badge="Deterministic Architecture"
          title="Targeted intelligence for real product work."
          description="Whether you need AVIS to inspect a domain DNS record, SCOUT to run the 5-signal opportunity match formula, QUILL to review a proof-of-work deliverable, or RELAY to ensure secure communication, each Dot runs grounded tools with explicit user confirmation."
          primaryAction={{
            label: "Open Scout Matcher",
            href: "/dots/scout",
          }}
          secondaryAction={{
            label: "Explore Avis Trust Engine",
            href: "/dots/avis",
          }}
          visualContent={
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {DOTS.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] flex items-center gap-2.5"
                >
                  <div className="h-7 w-7 rounded-lg overflow-hidden border border-[#E5E5EA] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getDotAvatar(d.id)}
                      alt={d.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold tracking-tight text-[#1D1D1F] block">
                      {d.name}
                    </span>
                    <p className="text-[10.5px] text-[#6E6E73] truncate">
                      {d.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          }
        />

        {/* 4 Coworker Dots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOTS.map((dot) => {
            const Icon = dot.icon;
            return (
              <div
                key={dot.id}
                className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 shadow-xs hover:border-[#D1D1D6] transition-all space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-11 w-11 rounded-xl overflow-hidden flex items-center justify-center border border-[#E5E5EA] flex-shrink-0 shadow-2xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getDotAvatar(dot.id)}
                        alt={dot.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
                        {dot.name}
                      </h2>
                      <p className="text-[13px] font-medium text-[#6E6E73]">
                        {dot.role}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E8F8EE] text-[#1D7F3E] border border-[#C1EAD0]">
                    {dot.status}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]/60">
                  <p className="text-[12.5px] font-medium italic text-[#1D1D1F]">
                    "{dot.question}"
                  </p>
                </div>

                <p className="text-[14px] text-[#6E6E73] leading-relaxed">
                  {dot.description}
                </p>

                {/* Capabilities list */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                    Key Capabilities
                  </p>
                  <ul className="grid grid-cols-1 gap-1 text-[12.5px] text-[#48484A]">
                    {dot.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: dot.accentColor }}
                        />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Open Workspace Action */}
                <div className="pt-4 border-t border-[#F0F0F2] flex items-center justify-between">
                  <span className="text-[12px] text-[#86868B]">
                    {dot.workflows.length} guided workflows
                  </span>
                  <Link
                    href={`/dots/${dot.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white transition-all shadow-2xs hover:opacity-95"
                    style={{ backgroundColor: dot.accentColor }}
                  >
                    <span>Launch {dot.name} Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
