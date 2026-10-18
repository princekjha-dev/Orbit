import { resolveStartup } from "@/lib/startups/service";
import { getCurrentUser } from "@/lib/auth/helpers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Rocket,
  Globe,
  MapPin,
  Users,
  Target,
  Briefcase,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const startup = await resolveStartup(slug);
  if (!startup) {
    return { title: "Startup Not Found — Orbit" };
  }
  return {
    title: `${startup.name} — Startup Venture on Orbit`,
    description: startup.description || `${startup.name} is building in ${startup.industry} on Orbit.`,
  };
}

export default async function StartupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const startup = await resolveStartup(slug, { fullWorkspace: true });

  if (!startup) {
    notFound();
  }

  const user = await getCurrentUser();
  const userId = user?.id;
  const isMemberOrCreator =
    userId &&
    (startup.creatorId === userId ||
      startup.members?.some((m: any) => m.userId === userId));

  const milestones = startup.milestones || [];
  const hiringNeeds = startup.hiringNeeds || [];
  const members = startup.members || [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/startups" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
              &larr; Startups Directory
            </Link>
            <span className="text-neutral-300">/</span>
            <Badge variant="blue" className="text-[10px] uppercase font-semibold">
              {startup.stage} Stage
            </Badge>
            <Badge variant="neutral" className="text-[10px]">
              {startup.industry}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
            {startup.name}
          </h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-3xl leading-relaxed">
            {startup.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {startup.website && (
            <a href={startup.website} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Website
                <ExternalLink className="h-3 w-3 text-neutral-400" />
              </Button>
            </a>
          )}
          {isMemberOrCreator ? (
            <Link href={`/startups/${startup.slug}/workspace`}>
              <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-sm">
                <Rocket className="h-4 w-4" />
                Founder Workspace
              </Button>
            </Link>
          ) : (
            <Link href="/messages">
              <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-sm">
                Connect with Team
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Grid: Main Info + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem & Solution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 bg-white border border-neutral-200">
              <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Problem Statement
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {startup.problem}
              </p>
            </Card>

            <Card className="p-5 bg-brand-50/30 border border-brand-200">
              <h2 className="text-xs font-semibold text-brand-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Solution & Technical Architecture
              </h2>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {startup.solution}
              </p>
            </Card>
          </div>

          {/* Core Tech Stack */}
          {startup.requiredSkills && (
            <Card className="p-5 bg-white border border-neutral-200">
              <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                Core Stack & Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {startup.requiredSkills.split(",").map((sk: string) => (
                  <Badge key={sk} variant="neutral" className="text-xs py-1 px-2.5 bg-neutral-100 text-neutral-800">
                    {sk.trim()}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Active Milestones Roadmap */}
          <Card className="p-5 bg-white border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-4 w-4 text-neutral-500" />
                Venture Milestones ({milestones.length})
              </h2>
              <span className="text-[11px] text-neutral-400">Verifiable Roadmap</span>
            </div>

            {milestones.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">No public milestones posted yet.</p>
            ) : (
              <div className="space-y-3">
                {milestones.map((ms: any) => {
                  const isCompleted = ms.status === "COMPLETED";
                  return (
                    <div
                      key={ms.id}
                      className="p-3.5 rounded-lg border border-neutral-100 bg-neutral-50 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">{ms.title}</p>
                          {ms.description && (
                            <p className="text-[11px] text-neutral-500 mt-0.5">{ms.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={isCompleted ? "green" : "blue"}
                        className="text-[10px] shrink-0 font-medium"
                      >
                        {ms.status.replace("_", " ")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Open Roles & Hiring Needs */}
          {hiringNeeds.length > 0 && (
            <Card className="p-5 bg-white border border-neutral-200">
              <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-neutral-500" />
                Open Roles & Co-Founder Opportunities
              </h2>

              <div className="space-y-3">
                {hiringNeeds.map((hn: any) => (
                  <div
                    key={hn.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-neutral-900">{hn.title}</h3>
                        <Badge variant="blue" className="text-[10px]">
                          {hn.roleType || "FULL_TIME"}
                        </Badge>
                      </div>
                      {hn.skills && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(Array.isArray(hn.skills) ? hn.skills : [hn.skills]).map((s: string) => (
                            <span key={s} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link href={`/messages?recipient=${startup.creatorId}&subject=Interest+in+${encodeURIComponent(hn.title)}`}>
                      <Button size="sm" variant="outline" className="text-xs shrink-0">
                        Express Interest
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Quick Specs */}
          <Card className="p-5 bg-white border border-neutral-200 space-y-3">
            <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Venture Details
            </h2>

            <div className="space-y-2 text-xs divide-y divide-neutral-100">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-neutral-500">Stage</span>
                <span className="font-semibold text-neutral-800">{startup.stage}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-neutral-500">Industry</span>
                <span className="font-semibold text-neutral-800">{startup.industry}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-neutral-500">Location</span>
                <span className="font-semibold text-neutral-800">{startup.location || "Remote"}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-neutral-500">Team Size</span>
                <span className="font-semibold text-neutral-800">{members.length || 1} members</span>
              </div>
            </div>
          </Card>

          {/* Founding Team */}
          <Card className="p-5 bg-white border border-neutral-200">
            <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-neutral-500" />
              Founding Team
            </h2>

            <div className="space-y-3">
              {members.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {m.name ? m.name.charAt(0) : m.user?.name ? m.user.name.charAt(0) : "F"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">
                      {m.name || m.user?.name || "Founding Member"}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {m.role || "FOUNDER"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
