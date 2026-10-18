import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/helpers";
import { safeDbCall, prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { ContentRail } from "@/components/ui/content-rail";
import { FeaturePanel } from "@/components/ui/feature-panel";
import {
  OpportunityCard,
  ProjectCard,
  EventCard,
  DotCard,
} from "@/components/ui/orbit-cards";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  FolderKanban,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Compass,
  FileCheck2,
  Users2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Home",
  description: "Personal Orbit workspace. Build your next move.",
};

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  // Load real opportunities, projects, and events from database with safe resilient fallback
  const oppsData = await safeDbCall(
    () =>
      prisma.opportunity.findMany({
        where: { isActive: true },
        include: { organization: { select: { name: true, slug: true, verificationStatus: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    []
  );

  const projData = await safeDbCall(
    () =>
      prisma.project.findMany({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        include: {
          organization: { select: { name: true } },
          _count: { select: { applications: true, deliverables: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
    []
  );

  const evData = await safeDbCall(
    () =>
      prisma.event.findMany({
        where: { isDeleted: false },
        include: { organization: { select: { name: true } } },
        orderBy: { startDate: "asc" },
        take: 6,
      }),
    []
  );

  const opportunities = oppsData || [];
  const projects = projData || [];
  const events = evData || [];

  const DOTS = [
    {
      id: "atlas",
      name: "ATLAS",
      role: "Research & Knowledge",
      description: "Rigorous technical ground truth, methodology precedents, and specialized collaborator discovery.",
      capabilities: ["Architecture literature", "Specialist discovery", "Empirical citations"],
      accentColor: "#0071E3",
    },
    {
      id: "scout",
      name: "SCOUT",
      role: "Career & Opportunity",
      description: "Deterministic 5-signal matching formula (skills, availability, timezone, interest, evidence).",
      capabilities: ["Signal ranking", "Role fit scoring", "Complementary teams"],
      accentColor: "#34C759",
    },
    {
      id: "forge",
      name: "FORGE",
      role: "Founder & Venture",
      description: "Startup thesis acceleration, product spec staging, and complementary co-founder matching.",
      capabilities: ["Sprint deliverables", "Mentor matching", "Investor readiness"],
      accentColor: "#FF9500",
    },
    {
      id: "signal",
      name: "SIGNAL",
      role: "Talent & Recruiting",
      description: "Meritocratic candidate shortlisting based on verifiable deliverables and practical work proof.",
      capabilities: ["Deliverable review", "Skill alignment", "Personalized outreach"],
      accentColor: "#34C759",
    },
    {
      id: "avis",
      name: "AVIS",
      role: "Trust & Verification",
      description: "Factual verification engine. Explains DNS TXT proofs, credential claims, and review status.",
      capabilities: ["DNS TXT inspection", "Org verification", "Audit trail review"],
      accentColor: "#0071E3",
    },
  ];

  return (
    <AppShell>
      <OrbitHeader
        title="Home"
        actions={
          <Link
            href="/opportunities"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED] transition-colors"
          >
            Explore <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="atmos-home min-h-screen px-4 sm:px-6 lg:px-8 py-6 space-y-10 max-w-[1240px] mx-auto w-full">
        {/* Large Editorial Intro */}
        <PageIntro
          eyebrow={user?.name ? `Welcome back, ${user.name}` : "Orbit Workspace"}
          title="Build your next move."
          description="Discover credible opportunities, advance high-impact projects, and collaborate with your verified coworker Dots."
        />

        {/* Feature Hero Panel: Spotlight on Next Move */}
        <FeaturePanel
          theme="blue"
          eyebrow="Curated For You"
          badge="Verified Pipeline"
          title="Credible work. Provable evidence."
          description="Orbit pairs you with vetted startup teams and industry leaders. Complete scoped deliverables to automatically earn permanent, cryptographic proof-of-work records."
          primaryAction={{
            label: "Explore Opportunities",
            href: "/opportunities",
          }}
          secondaryAction={{
            label: "Meet Coworker Dots",
            href: "/dots",
          }}
          visualContent={
            <div className="w-full max-w-sm rounded-xl border border-[#B9DCFF]/80 bg-white p-4 shadow-subtle space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-[#6E6E73]">
                <span className="flex items-center gap-1.5 text-[#0071E3] font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> AVIS Verified
                </span>
                <span>Active Workspace</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F5F5F7] space-y-1">
                <p className="text-xs font-semibold text-[#1D1D1F]">
                  Proof-of-Work Standard
                </p>
                <p className="text-[11.5px] text-[#6E6E73] leading-snug">
                  Every project deliverable accepted by a partner organization issues an immutable verifiable credential.
                </p>
              </div>
            </div>
          }
        />

        {/* Recommended Opportunities Content Rail */}
        <ContentRail
          title="Recommended Opportunities"
          subtitle="Positions and internships with verified organizations"
          action={
            <Link
              href="/opportunities"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              All opportunities <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {opportunities.length > 0 ? (
            opportunities.map((opp) => (
              <div key={opp.id} className="min-w-[300px] sm:min-w-[340px] snap-start">
                <OpportunityCard
                  id={opp.id}
                  title={opp.title}
                  organization={opp.organization?.name || "Verified Organization"}
                  organizationSlug={opp.organization?.slug}
                  location={opp.location || "Remote"}
                  type={opp.type}
                  workMode={opp.workMode}
                  stipend={(opp as any).stipend || (opp as any).compensation || "Competitive"}
                  skills={(opp as any).skills || ["Engineering", "Product"]}
                  isVerified={opp.organization?.verificationStatus === "VERIFIED"}
                />
              </div>
            ))
          ) : (
            [
              {
                id: "demo-opp-frontend-intern",
                title: "Frontend Engineer Intern",
                org: "Nexora Labs",
                slug: "nexora-labs",
                loc: "Bengaluru, Karnataka (Hybrid)",
                type: "INTERNSHIP" as const,
                stipend: "₹4 LPA – ₹6 LPA",
                skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
              },
              {
                id: "demo-opp-ai-intern",
                title: "AI Engineering Intern",
                org: "Nexora Labs",
                slug: "nexora-labs",
                loc: "Remote (India)",
                type: "INTERNSHIP" as const,
                stipend: "₹5 LPA – ₹8 LPA",
                skills: ["Python", "FastAPI", "AI/ML", "PyTorch"],
              },
              {
                id: "demo-opp-product-designer",
                title: "Product Designer",
                org: "Astra Digital Technologies",
                slug: "astra-digital",
                loc: "Gurugram, Haryana (Hybrid)",
                type: "JOB" as const,
                stipend: "₹8 LPA – ₹14 LPA",
                skills: ["Figma", "UI/UX Design", "Design Systems"],
              },
              {
                id: "demo-opp-fullstack-dev",
                title: "Full Stack Developer",
                org: "Astra Digital Technologies",
                slug: "astra-digital",
                loc: "Pune / Remote",
                type: "JOB" as const,
                stipend: "₹10 LPA – ₹16 LPA",
                skills: ["TypeScript", "React", "Next.js", "PostgreSQL"],
              },
            ].map((item) => (
              <div key={item.id} className="min-w-[300px] sm:min-w-[340px] snap-start">
                <OpportunityCard
                  id={item.id}
                  title={item.title}
                  organization={item.org}
                  organizationSlug={item.slug}
                  location={item.loc}
                  type={item.type}
                  workMode={item.loc.includes("Remote") ? "REMOTE" : "HYBRID"}
                  stipend={item.stipend}
                  skills={item.skills}
                  isVerified={true}
                />
              </div>
            ))
          )}
        </ContentRail>

        {/* Coworker Dots Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F]">
                Coworker Dots
              </h2>
              <p className="text-[13.5px] text-[#6E6E73] mt-0.5">
                Specialized digital coworkers ready to analyze, discover, and verify
              </p>
            </div>
            <Link
              href="/dots"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              All Dots <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOTS.map((dot) => (
              <DotCard
                key={dot.id}
                id={dot.id}
                name={dot.name}
                role={dot.role}
                description={dot.description}
                capabilities={dot.capabilities}
                accentColor={dot.accentColor}
              />
            ))}
          </div>
        </section>

        {/* Featured Projects Content Rail */}
        <ContentRail
          title="Active Projects"
          subtitle="Collaborate on scoped engineering and product work"
          action={
            <Link
              href="/projects"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              All projects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {projects.length > 0 ? (
            projects.map((proj) => (
              <div key={proj.id} className="min-w-[300px] sm:min-w-[340px] snap-start">
                <ProjectCard
                  id={proj.id}
                  title={proj.title}
                  description={proj.problem || "Collaborative engineering workspace."}
                  ownerName={proj.organization?.name || "Project Lead"}
                  status={proj.status}
                  membersCount={proj._count?.applications || 1}
                />
              </div>
            ))
          ) : (
            [
              {
                id: "demo-proj-career-copilot",
                title: "AI Career Copilot",
                description: "Autonomous skill extraction, GitHub proof validation, and matching engine for developers across India.",
                owner: "Aarav Sharma",
                category: "AI & DevTools",
                status: "In Progress",
                members: 2,
                openRoles: 2,
              },
              {
                id: "demo-proj-bharat-commerce",
                title: "Bharat Local Commerce Platform",
                description: "Zero-commission open network commerce interface for local retailers and Tier 2/3 town artisans.",
                owner: "Vikram Malhotra",
                category: "Commerce",
                status: "Active",
                members: 3,
                openRoles: 2,
              },
              {
                id: "demo-proj-startup-workspace",
                title: "Startup Validation Workspace",
                description: "Structured customer discovery, hypothesis tracker, and problem-solution fit canvas for Indian founders.",
                owner: "Riya Mehta",
                category: "Venture Tools",
                status: "Active",
                members: 3,
                openRoles: 2,
              },
            ].map((p) => (
              <div key={p.id} className="min-w-[300px] sm:min-w-[340px] snap-start">
                <ProjectCard
                  id={p.id}
                  title={p.title}
                  description={p.description}
                  ownerName={p.owner}
                  category={p.category}
                  status={p.status}
                  membersCount={p.members}
                  openRolesCount={p.openRoles}
                />
              </div>
            ))
          )}
        </ContentRail>

        {/* Upcoming Events Content Rail */}
        <ContentRail
          title="Upcoming Events & Hackathons"
          subtitle="Conferences, demo days, and competitive hackathons in India"
          action={
            <Link
              href="/events"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              All events <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {events.length > 0 ? (
            events.map((ev) => (
              <div key={ev.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                <EventCard
                  id={ev.id}
                  title={ev.title}
                  organizer={ev.organization?.name || "Orbit Ecosystem"}
                  date={new Date(ev.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  location={(ev as any).location || "Online"}
                  format={ev.format}
                />
              </div>
            ))
          ) : (
            [
              {
                id: "demo-hack-buildathon",
                title: "Orbit India Buildathon 2026",
                organizer: "India Builders Network",
                date: "Nov 14, 2026",
                location: "Online (Pan-India)",
                format: "ONLINE" as const,
              },
              {
                id: "demo-ev-ai-meetup",
                title: "India AI Builders Meetup",
                organizer: "India Builders Network",
                date: "Nov 20, 2026",
                location: "Koramangala, Bengaluru",
                format: "HYBRID" as const,
              },
              {
                id: "demo-ev-startup-systems",
                title: "Startup Systems Night",
                organizer: "Astra Digital Technologies",
                date: "Nov 26, 2026",
                location: "Cyber City, Gurugram",
                format: "ONSITE" as const,
              },
            ].map((ev) => (
              <div key={ev.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                <EventCard
                  id={ev.id}
                  title={ev.title}
                  organizer={ev.organizer}
                  date={ev.date}
                  location={ev.location}
                  format={ev.format}
                />
              </div>
            ))
          )}
        </ContentRail>
      </div>
    </AppShell>
  );
}
