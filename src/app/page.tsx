import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ORBIT_AVATAR } from "@/lib/avatars";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileCheck2,
  FolderKanban,
  GraduationCap,
  Layers,
  Lightbulb,
  Mail,
  MessageCircle,
  Network,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";

const ecosystem = [
  {
    title: "Talent",
    description: "Find opportunities, projects, mentors and communities.",
    icon: Users,
    href: "/discover",
    tag: "Builders & Engineers",
  },
  {
    title: "Founders",
    description: "Build teams, launch ideas and discover talent.",
    icon: Lightbulb,
    href: "/startups",
    tag: "Early Ventures",
  },
  {
    title: "Recruiters",
    description: "Find relevant candidates and manage hiring.",
    icon: BriefcaseBusiness,
    href: "/discover?type=people",
    tag: "Hiring Teams",
  },
  {
    title: "Mentors",
    description: "Help people and projects move forward.",
    icon: MessageCircle,
    href: "/communities",
    tag: "Advisory & Guidance",
  },
  {
    title: "Organizations",
    description: "Build teams and publish opportunities.",
    icon: Building2,
    href: "/opportunities",
    tag: "Companies & Labs",
  },
  {
    title: "Communities",
    description: "Bring people together through events and hackathons.",
    icon: Network,
    href: "/communities",
    tag: "Events & Guilds",
  },
];

const discoverItems = [
  {
    title: "People",
    description: "Skills, experience and goals",
    icon: Users,
    href: "/discover?type=people",
    badge: "Profiles",
  },
  {
    title: "Startups",
    description: "Ideas and teams taking shape",
    icon: Rocket,
    href: "/startups",
    badge: "Ventures",
  },
  {
    title: "Projects",
    description: "Real work to build together",
    icon: FolderKanban,
    href: "/projects",
    badge: "Collaboration",
  },
  {
    title: "Opportunities",
    description: "Roles and ways to contribute",
    icon: BriefcaseBusiness,
    href: "/opportunities",
    badge: "Roles & Grants",
  },
  {
    title: "Events",
    description: "Meetups and shared learning",
    icon: CalendarDays,
    href: "/events",
    badge: "Gatherings",
  },
  {
    title: "Hackathons",
    description: "Build with a team and a deadline",
    icon: Trophy,
    href: "/hackathons",
    badge: "Competitions",
  },
  {
    title: "Communities",
    description: "People around shared interests",
    icon: Network,
    href: "/communities",
    badge: "Technical Spaces",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Build a profile around your skills, experience and goals.",
    detail: "Showcase observable proof of work, projects, and target roles.",
    icon: UserCheck,
  },
  {
    number: "02",
    title: "Discover",
    description: "Find people, opportunities, projects, startups, communities and events.",
    detail: "Filter semantically by tech stack, verified badges, and timezone.",
    icon: Compass,
  },
  {
    number: "03",
    title: "Connect",
    description: "Apply, collaborate, find mentors or connect with relevant people.",
    detail: "Use mutual permissions and personalized Outreach Copilot drafts.",
    icon: MessageCircle,
  },
  {
    number: "04",
    title: "Build what comes next",
    description: "Turn conversations and opportunities into projects, teams and careers.",
    detail: "Ship deliverables, accumulate evidence, and accelerate together.",
    icon: Rocket,
  },
];

const linkClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-5 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#0077ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]";
const quietLinkClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#D2D2D7] bg-white px-5 py-3 text-sm font-semibold text-[#1D1D1F] transition-all hover:bg-[#F5F5F7] hover:border-[#86868B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#1D1D1F] antialiased selection:bg-[#B9DCFF]/50">
      {/* ─── NAVIGATION BAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#E5E5EA] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Orbit home"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071E3]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ORBIT_AVATAR} alt="Orbit" className="h-7 w-7 object-contain" />
            <span className="text-base font-bold tracking-tight text-[#1D1D1F]">Orbit</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
            <Link
              href="/discover"
              className="text-xs font-medium text-[#6E6E73] transition-colors hover:text-[#0071E3]"
            >
              Discover
            </Link>
            <Link
              href="/opportunities"
              className="text-xs font-medium text-[#6E6E73] transition-colors hover:text-[#0071E3]"
            >
              Opportunities
            </Link>
            <Link
              href="/projects"
              className="text-xs font-medium text-[#6E6E73] transition-colors hover:text-[#0071E3]"
            >
              Projects
            </Link>
            <Link
              href="/startups"
              className="text-xs font-medium text-[#6E6E73] transition-colors hover:text-[#0071E3]"
            >
              Startups
            </Link>
            <Link
              href="/events"
              className="text-xs font-medium text-[#6E6E73] transition-colors hover:text-[#0071E3]"
            >
              Events
            </Link>
            <Link
              href="/communities"
              className="text-xs font-medium text-[#6E6E73] transition-colors hover:text-[#0071E3]"
            >
              Communities
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-[#1D1D1F] transition-colors hover:text-[#0071E3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#0071E3] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#0077ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
            >
              Create your profile
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 1. HERO SECTION ────────────────────────────────────────── */}
      <section className="relative border-b border-[#E5E5EA] bg-gradient-to-b from-[#F5F5F7] via-white to-white py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D2D2D7] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#0071E3] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0071E3]" />
              Entrepreneurship × Talent × Opportunity
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#1D1D1F] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12]">
              Turn skills, ideas, and opportunities into real connections.
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-base leading-relaxed text-[#6E6E73] sm:text-lg">
              Orbit brings talent, founders, recruiters, mentors, projects, startups,
              communities, events, and opportunities into one ecosystem.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className={linkClass} href="/discover">
                Explore Orbit <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={quietLinkClass} href="#how-it-works">
                See how it works <ArrowDown className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Product Preview / Visual Section */}
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="relative rounded-2xl border border-[#D2D2D7] bg-white shadow-xl overflow-hidden">
              {/* Window Header */}
              <div className="flex h-10 items-center justify-between border-b border-[#E5E5EA] bg-[#F5F5F7] px-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                </div>
                <div className="flex items-center gap-2 rounded-md border border-[#E5E5EA] bg-white px-3 py-1 text-[11px] font-mono text-[#6E6E73]">
                  <Search className="h-3 w-3 text-[#86868B]" />
                  <span>orbit.app/discover</span>
                </div>
                <span className="text-[10px] font-medium text-[#34C759] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] animate-pulse" />
                  Ecosystem Live
                </span>
              </div>

              {/* Window Content Grid */}
              <div className="p-5 sm:p-7 bg-[#FAFAFC] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Talent Card Preview */}
                <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#E8F2FF] text-[#0071E3] font-semibold text-[10px]">
                      Talent Profile
                    </span>
                    <ShieldCheck className="h-3.5 w-3.5 text-[#34C759]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1D1D1F]">Aarav Sharma</p>
                    <p className="text-xs text-[#6E6E73]">Software Engineer / AI Developer</p>
                    <p className="text-[11px] text-[#86868B] mt-0.5">Bengaluru, India</p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="px-1.5 py-0.5 text-[10px] bg-[#F5F5F7] text-[#1D1D1F] rounded">React</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-[#F5F5F7] text-[#1D1D1F] rounded">Next.js</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-[#F5F5F7] text-[#1D1D1F] rounded">FastAPI</span>
                  </div>
                  <div className="border-t border-[#F0F0F2] pt-2 text-[11px] text-[#34C759] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Proof of Work Verified
                  </div>
                </div>

                {/* 2. Startup Card Preview */}
                <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#FFF4E5] text-[#FF9500] font-semibold text-[10px]">
                      Pre-Seed Startup
                    </span>
                    <Rocket className="h-3.5 w-3.5 text-[#FF9500]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1D1D1F]">Nexora Labs</p>
                    <p className="text-xs text-[#6E6E73]">AI Workflow Orchestration</p>
                    <p className="text-[11px] text-[#86868B] mt-0.5">Mumbai & Bengaluru</p>
                  </div>
                  <div className="space-y-1 pt-1 text-[11px] text-[#6E6E73]">
                    <div className="flex justify-between">
                      <span>Milestones:</span>
                      <span className="font-semibold text-[#1D1D1F]">2 of 3 Done</span>
                    </div>
                    <div className="w-full bg-[#E5E5EA] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#FF9500] h-full w-2/3 rounded-full" />
                    </div>
                  </div>
                  <div className="border-t border-[#F0F0F2] pt-2 text-[11px] text-[#0071E3] font-medium">
                    Hiring: 2 Roles Open
                  </div>
                </div>

                {/* 3. Opportunity Card Preview */}
                <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#EBF9F1] text-[#34C759] font-semibold text-[10px]">
                      Opportunity
                    </span>
                    <Briefcase className="h-3.5 w-3.5 text-[#34C759]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1D1D1F]">Frontend Engineer Intern</p>
                    <p className="text-xs text-[#6E6E73]">Nexora Labs • Hybrid</p>
                    <p className="text-[11px] text-[#0071E3] font-semibold mt-0.5">₹4 LPA – ₹6 LPA</p>
                  </div>
                  <p className="text-[11px] text-[#6E6E73] leading-relaxed line-clamp-2">
                    Build autonomous AI agent interfaces with Next.js and TypeScript.
                  </p>
                  <div className="border-t border-[#F0F0F2] pt-2 text-[11px] text-[#6E6E73]">
                    Status: <span className="font-semibold text-[#34C759]">Accepting Candidates</span>
                  </div>
                </div>

                {/* 4. Project Card Preview */}
                <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#F3E8FF] text-[#AF52DE] font-semibold text-[10px]">
                      Active Project
                    </span>
                    <FolderKanban className="h-3.5 w-3.5 text-[#AF52DE]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1D1D1F]">AI Career Copilot</p>
                    <p className="text-xs text-[#6E6E73]">Astra Digital Technologies</p>
                    <p className="text-[11px] text-[#AF52DE] font-semibold mt-0.5">₹50,000 Milestone Grant</p>
                  </div>
                  <p className="text-[11px] text-[#6E6E73] leading-relaxed line-clamp-2">
                    Verifiable portfolio analyzer inspecting commit history and PR complexity.
                  </p>
                  <div className="border-t border-[#F0F0F2] pt-2 text-[11px] text-[#6E6E73] flex items-center justify-between">
                    <span>Contributors:</span>
                    <span className="font-semibold text-[#1D1D1F]">3 of 4 Filled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. ECOSYSTEM SECTION ───────────────────────────────────── */}
      <section id="ecosystem" className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
            Comprehensive Directory
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
            One ecosystem. Many ways forward.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#6E6E73]">
            Different goals, one place to find the people and opportunities that help you move.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ecosystem.map(({ title, description, icon: Icon, href, tag }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col justify-between rounded-2xl border border-[#E5E5EA] bg-white p-6 transition-all hover:border-[#0071E3] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071E3]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F5F7] text-[#0071E3] transition-colors group-hover:bg-[#E8F2FF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#86868B]">{tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">{description}</p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#0071E3]">
                <span>Explore {title}</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 3. HOW ORBIT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-16 border-y border-[#E5E5EA] bg-[#F5F5F7] py-20 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
              Simple & Transparent
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
              How Orbit works
            </h2>
            <p className="mt-3 text-base text-[#6E6E73]">
              A clear, four-step path from first profile setup to verifiable momentum.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ number, title, description, detail, icon: Icon }) => (
              <div
                key={number}
                className="relative rounded-2xl border border-[#E5E5EA] bg-white p-6 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#0071E3] bg-[#E8F2FF] px-2.5 py-1 rounded-md">
                      {number}
                    </span>
                    <Icon className="h-4 w-4 text-[#86868B]" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#1D1D1F]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">{description}</p>
                </div>
                <div className="mt-6 border-t border-[#F0F0F2] pt-3">
                  <p className="text-[11px] text-[#86868B]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. DISCOVER SECTION ────────────────────────────────────── */}
      <section id="discover" className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">Discovery</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
              Find what&apos;s next.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#6E6E73]">
              Explore people, projects, startups, opportunities, events, hackathons and
              communities across the Orbit ecosystem.
            </p>
            <div className="mt-8">
              <Link className={linkClass} href="/discover">
                Explore Discover <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {discoverItems.map(({ title, description, icon: Icon, href, badge }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-xl border border-[#E5E5EA] bg-white p-4 transition-all hover:border-[#0071E3] hover:shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-[#0071E3]" />
                  <span className="text-[10px] font-medium text-[#86868B]">{badge}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                  {title}
                </h3>
                <p className="mt-1 text-xs text-[#6E6E73] leading-relaxed">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. OPPORTUNITIES SECTION ───────────────────────────────── */}
      <section id="opportunities" className="border-y border-[#E5E5EA] bg-[#F5F5F7] py-20 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
                Work with Direction
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
                Opportunities that connect to your next move.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#6E6E73]">
                Orbit is more than a traditional job board. Explore verified jobs, internships,
                fellowships, collaborative projects, startup roles, and milestone opportunities.
              </p>
              <div className="mt-7">
                <Link className={linkClass} href="/opportunities">
                  Explore opportunities <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Jobs", desc: "Full-time & part-time engineering, design, and operations roles.", href: "/opportunities?type=JOB" },
                { label: "Internships", desc: "Hands-on student and early-career placements with mentorship.", href: "/opportunities?type=INTERNSHIP" },
                { label: "Fellowships", desc: "In-depth research and builder residencies with verified grants.", href: "/opportunities?type=FELLOWSHIP" },
                { label: "Projects", desc: "Scoped deliverables and milestone contributions with proof of work.", href: "/projects" },
                { label: "Startup roles", desc: "Founding member and core team opportunities at early ventures.", href: "/startups" },
                { label: "Collaboration", desc: "Co-founding, open-source sprints, and complementary partnerships.", href: "/discover" },
              ].map(({ label, desc, href }, i) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-xl border border-[#E5E5EA] bg-white p-4 transition-all hover:border-[#0071E3] hover:shadow-2xs"
                >
                  <span className="text-[10px] font-mono font-bold text-[#86868B]">0{i + 1}</span>
                  <h3 className="mt-2 text-sm font-semibold text-[#1D1D1F]">{label}</h3>
                  <p className="mt-1 text-xs text-[#6E6E73] leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. BUILD SECTION ───────────────────────────────────────── */}
      <section id="build" className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">From Spark to Venture</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
            Have an idea? Build it with people.
          </h2>
          <p className="mt-3 text-base text-[#6E6E73]">
            Move from a first thesis to shared deliverables, a stronger team, and a venture that grows.
          </p>

          {/* Stepper Pipeline */}
          <div className="mt-8 rounded-2xl border border-[#E5E5EA] bg-[#F5F5F7] p-4 sm:p-6 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[620px]">
              {[
                "Idea",
                "Find people",
                "Form a team",
                "Build",
                "Share",
                "Grow",
              ].map((stepLabel, idx) => (
                <div key={stepLabel} className="flex items-center gap-3">
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
                    <span className="h-6 w-6 rounded-full bg-white border border-[#D2D2D7] flex items-center justify-center text-[10px] font-mono text-[#0071E3]">
                      {idx + 1}
                    </span>
                    {stepLabel}
                  </span>
                  {idx < 5 && <ArrowRight className="h-3.5 w-3.5 text-[#86868B]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Two Feature Cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-7 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F2FF] text-[#0071E3]">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[#1D1D1F]">Projects</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
                  Collaborate on real work and find people with complementary skills.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-[#6E6E73]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#34C759]" /> Clear problems, deliverables, and acceptance criteria
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#34C759]" /> Milestone-based payments and grants
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#34C759]" /> Permanent proof of work stored in Evidence Passport
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0F0F2]">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:underline"
                >
                  Explore projects <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-7 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E5] text-[#FF9500]">
                  <Rocket className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[#1D1D1F]">Startups</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
                  Turn ideas into ventures with talent, mentors and opportunities around you.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-[#6E6E73]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FF9500]" /> Dedicated founder workspaces with milestone tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FF9500]" /> Assemble complementary builder teams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FF9500]" /> Connect with verified advisors and design partners
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0F0F2]">
                <Link
                  href="/startups"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:underline"
                >
                  Explore startups <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. CONNECTIONS SECTION ─────────────────────────────────── */}
      <section id="connections" className="border-y border-[#E5E5EA] bg-[#1D1D1F] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
                Useful Professional Connections
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Meet people who can move your idea forward.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/70">
                Orbit is not a generic social network. Every connection is anchored in observable
                competence, complementary skills, and real deliverables.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: "Talent", desc: "Engineers, designers & researchers ready to build." },
                { title: "Founders", desc: "Entrepreneurs validating theses and assembling teams." },
                { title: "Recruiters", desc: "Technical recruiters evaluating proof over keywords." },
                { title: "Mentors", desc: "Experienced operators providing structured guidance." },
                { title: "Builders", desc: "Open-source contributors shipping projects." },
                { title: "Communities", desc: "Curated guilds hosting meetups and sprints." },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs"
                >
                  <p className="text-xs font-semibold text-white">{title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/60">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. OUTREACH COPILOT SECTION ────────────────────────────── */}
      <section id="outreach-copilot" className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-[#D2D2D7] bg-[#F5F5F7] px-2.5 py-1 text-xs font-semibold text-[#0071E3]">
              <Sparkles className="h-3.5 w-3.5 text-[#0071E3]" />
              Outreach Copilot
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
              Reach out with purpose.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#6E6E73]">
              Find relevant people and prepare personalized outreach without sending anything automatically.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-[#34C759] mt-0.5 shrink-0" />
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  <strong className="text-[#1D1D1F]">Full human control:</strong> Every message draft must be manually reviewed, edited, and explicitly approved before dispatch.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#0071E3] mt-0.5 shrink-0" />
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  <strong className="text-[#1D1D1F]">Context-grounded:</strong> Drafts synthesize verified project code, hackathon deliverables, and mutual goals.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E5EA] bg-[#F5F5F7] p-5 sm:p-7 shadow-xs space-y-5">
            {/* 6 Step Sequence */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                "Discover relevant person",
                "Generate personalized draft",
                "Review",
                "Edit",
                "Approve",
                "Send",
              ].map((stepName, i) => (
                <div key={stepName} className="rounded-lg border border-[#E5E5EA] bg-white p-2.5">
                  <span className="text-[10px] font-mono font-bold text-[#0071E3]">0{i + 1}</span>
                  <p className="mt-1 text-xs font-semibold text-[#1D1D1F]">{stepName}</p>
                </div>
              ))}
            </div>

            {/* Realistic Draft Preview */}
            <div className="rounded-xl border border-[#D2D2D7] bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#F0F0F2] pb-2 text-xs">
                <span className="text-[#86868B] flex items-center gap-1.5 font-mono text-[11px]">
                  <Mail className="h-3.5 w-3.5 text-[#0071E3]" /> Outbox Draft Preview
                </span>
                <span className="text-[10px] font-semibold text-[#FF9500] bg-[#FFF4E5] px-2 py-0.5 rounded">
                  Requires Confirmation
                </span>
              </div>
              <div className="space-y-1 text-xs text-[#6E6E73]">
                <p><strong className="text-[#1D1D1F]">To:</strong> riya@nexoralabs.ai (Founder, Nexora Labs)</p>
                <p><strong className="text-[#1D1D1F]">Subject:</strong> Frontend Engineer Intern — Next.js & AI Workflow Systems</p>
              </div>
              <p className="text-xs text-[#6E6E73] leading-relaxed bg-[#F5F5F7] p-3 rounded-lg border border-[#E5E5EA]">
                &quot;Hi Riya, I reviewed Nexora Labs&apos; milestone roadmap. With verified project deliverables in Next.js and async FastAPI pipelines, I&apos;d love to contribute to your autonomous orchestration engine...&quot;
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#86868B] pt-1">
                <span>0 messages sent automatically</span>
                <span className="text-[#34C759] font-medium">Editable by sender</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. CAREER / GROWTH SECTION ─────────────────────────────── */}
      <section id="career" className="border-y border-[#E5E5EA] bg-[#F5F5F7] py-20 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
                Continuous Progression
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
                Build more than a résumé.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#6E6E73]">
                Make your skills visible through projects, collaboration and real work. Orbit
                enables you to assemble a living portfolio grounded in authentic deliverables.
              </p>
              <div className="mt-7">
                <Link className={quietLinkClass} href="/discover">
                  Explore ways to grow <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: "Career roadmap", icon: Compass },
                { title: "Mentorship", icon: MessageCircle },
                { title: "Projects", icon: FolderKanban },
                { title: "Portfolio", icon: BriefcaseBusiness },
                { title: "Communities", icon: Network },
                { title: "Events", icon: CalendarDays },
                { title: "Hackathons", icon: Trophy },
                { title: "Evidence & credentials", icon: ShieldCheck },
              ].map(({ title, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[#E5E5EA] bg-white p-4 text-center space-y-2 shadow-2xs"
                >
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F2FF] text-[#0071E3]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-[#1D1D1F]">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. FOR ORGANIZATIONS SECTION ──────────────────────────── */}
      <section id="organizations" className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
              For Organizations
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
              Build your team from the ecosystem.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#6E6E73]">
              Publish opportunities, discover verified talent, review applications, and manage hiring.
              Organizations can also sponsor projects and coordinate community hackathons.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Publish opportunities",
                "Discover talent",
                "Review applications",
                "Manage hiring",
                "Build projects",
                "Organize communities & events",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-[#1D1D1F]">
                  <CheckCircle2 className="h-4 w-4 text-[#0071E3] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link className={linkClass} href="/opportunities">
                Explore for organizations <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E5EA] bg-[#F5F5F7] p-6 space-y-4">
            <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1D1D1F]">Organization Verification</span>
                <span className="text-[#0071E3] font-semibold text-[11px]">AVIS Trust Protocol</span>
              </div>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Organizations verify domain identity via cryptographic DNS TXT challenges, ensuring candidates apply with full confidence.
              </p>
            </div>
            <div className="rounded-xl border border-[#E5E5EA] bg-white p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1D1D1F]">Recruiter Candidate Pipeline</span>
                <span className="text-[#34C759] font-semibold text-[11px]">Active Stages</span>
              </div>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Manage applicants across Applied, Shortlisted, Interview, and Selected with synchronized feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. EVENTS + COMMUNITIES SECTION ───────────────────────── */}
      <section id="events-communities" className="border-y border-[#E5E5EA] bg-[#F5F5F7] py-20 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
              Events · Hackathons · Communities
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
              Find your people offline and online.
            </h2>
            <p className="mt-3 text-base text-[#6E6E73]">
              Orbit connects people through technical meetups, competitive buildathons, and persistent community guilds.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Events",
                desc: "Architecture summits, developer meetups, and founder roundtables.",
                href: "/events",
                icon: CalendarDays,
                cta: "Explore events",
              },
              {
                title: "Hackathons",
                desc: "Competitive 48-hour buildathons with team pod matching and verified deliverables.",
                href: "/hackathons",
                icon: Trophy,
                cta: "Explore hackathons",
              },
              {
                title: "Communities",
                desc: "Curated technical spaces for AI engineers, founders, and specialized builders.",
                href: "/communities",
                icon: Network,
                cta: "Explore communities",
              },
            ].map(({ title, desc, href, icon: Icon, cta }) => (
              <Link
                key={title}
                href={href}
                className="group flex flex-col justify-between rounded-2xl border border-[#E5E5EA] bg-white p-6 transition-all hover:border-[#0071E3] hover:shadow-2xs"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F5F7] text-[#0071E3] group-hover:bg-[#E8F2FF] transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#1D1D1F]">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6E6E73]">{desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#0071E3]">
                  <span>{cta}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 12. FINAL CTA SECTION ──────────────────────────────────── */}
      <section className="bg-white py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">Start Somewhere</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
            Your next opportunity could start with one connection.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#6E6E73]">
            Explore people, projects and opportunities across Orbit.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className={linkClass} href="/discover">
              Explore Orbit <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className={quietLinkClass} href="/signup">
              Create your profile
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E5E5EA] bg-[#F5F5F7] px-4 py-8 text-xs text-[#6E6E73]">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ORBIT_AVATAR} alt="Orbit" className="h-5 w-5 object-contain" />
            <span>Orbit · Entrepreneurship × Talent × Opportunity</span>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/discover" className="hover:text-[#0071E3]">
              Discover
            </Link>
            <Link href="/opportunities" className="hover:text-[#0071E3]">
              Opportunities
            </Link>
            <Link href="/projects" className="hover:text-[#0071E3]">
              Projects
            </Link>
            <Link href="/startups" className="hover:text-[#0071E3]">
              Startups
            </Link>
            <Link href="/events" className="hover:text-[#0071E3]">
              Events
            </Link>
            <Link href="/hackathons" className="hover:text-[#0071E3]">
              Hackathons
            </Link>
            <Link href="/communities" className="hover:text-[#0071E3]">
              Communities
            </Link>
            <Link href="/login" className="hover:text-[#0071E3]">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
