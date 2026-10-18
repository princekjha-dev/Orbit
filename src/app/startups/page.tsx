import { getCurrentUser } from "@/lib/auth/helpers";
import { listStartups } from "@/lib/startups/service";
import Link from "next/link";
import { Rocket, Plus, Search, Users, Target, ArrowRight, Building2, CheckCircle2, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup Workspace & Ecosystem — Orbit",
  description: "Browse early-stage ventures, explore founder workspaces, join building teams, and track milestones.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; industry?: string; stage?: string }>;
}

export default async function StartupsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const user = await getCurrentUser();
  const userId = user?.id;

  const startups = await listStartups({
    search: resolvedParams.q,
    industry: resolvedParams.industry,
    stage: resolvedParams.stage,
  });

  // Separate startups where user is creator/member vs all ecosystem startups
  const myStartups = userId
    ? startups.filter(
        (s: any) =>
          s.creatorId === userId ||
          s.members?.some((m: any) => m.userId === userId)
      )
    : [];

  const industries = ["ALL", "Developer Tools", "AI & Machine Learning", "FinTech", "HealthTech", "Web3 & Distributed Systems", "ClimateTech"];
  const stages = ["ALL", "IDEA", "PROTOTYPE", "MVP", "LAUNCHED", "SCALING"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" className="text-[11px] font-semibold bg-brand-50 text-brand-700 border-brand-200">
              Venture Ecosystem
            </Badge>
            <span className="text-xs text-neutral-400">Founder Workspaces · Milestones · Hiring Needs</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Startup Workspaces & Ventures
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Discover active builder ventures, review verifiable execution roadmaps, and join high-conviction founding teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/startups/new">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Launch Startup
            </Button>
          </Link>
        </div>
      </div>

      {/* Founder's Active Ventures (if logged in and has ventures) */}
      {myStartups.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Rocket className="h-4 w-4 text-brand-600" />
              Your Venture Workspaces ({myStartups.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myStartups.map((st: any) => (
              <Card key={st.id} className="p-5 border border-brand-200 bg-brand-50/20 hover:border-brand-300 transition-all shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-900">{st.name}</h3>
                      <Badge variant="blue" className="text-[10px] uppercase font-semibold">
                        {st.stage}
                      </Badge>
                      <Badge variant="neutral" className="text-[10px]">
                        {st.industry}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                  <Link href={`/startups/${st.slug}/workspace`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 bg-white hover:bg-neutral-50 shrink-0">
                      Workspace
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-brand-100 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                    {st._count?.members || st.members?.length || 1} team members
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-neutral-400" />
                    {st._count?.milestones || st.milestones?.length || 0} milestones
                  </span>
                  {st.hiringNeeds?.length > 0 && (
                    <span className="flex items-center gap-1 text-brand-700 font-medium">
                      <Briefcase className="h-3.5 w-3.5" />
                      {st.hiringNeeds.length} open roles
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Directory Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
        <form method="GET" action="/startups" className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              name="q"
              defaultValue={resolvedParams.q || ""}
              placeholder="Search ventures by name, problem statement, or tech stack..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="text-xs shrink-0">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {stages.slice(0, 4).map((stg) => {
            const isActive = (resolvedParams.stage || "ALL") === stg;
            return (
              <Link
                key={stg}
                href={`/startups?stage=${stg}${resolvedParams.q ? `&q=${resolvedParams.q}` : ""}`}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  isActive
                    ? "bg-neutral-900 text-white font-medium"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                {stg === "ALL" ? "All Stages" : stg}
              </Link>
            );
          })}
        </div>
      </div>

      {/* All Ecosystem Startups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-neutral-500" />
            All Ventures ({startups.length})
          </h2>
        </div>

        {startups.length === 0 ? (
          <EmptyState
            icon={<Rocket className="h-12 w-12 text-neutral-300" />}
            title="No startups found"
            description="No ventures matched your search query. Try adjusting your filter or be the first to launch one."
            action={
              <Link href="/startups/new">
                <Button size="sm" variant="primary" className="text-xs">
                  Launch Startup
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {startups.map((st: any) => (
              <Card key={st.id} className="p-5 border border-neutral-200 bg-white hover:border-neutral-300 transition-all shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      {st.name}
                    </h3>
                    <Badge variant="blue" className="text-[10px] shrink-0 font-medium">
                      {st.stage}
                    </Badge>
                  </div>
                  <Badge variant="neutral" className="text-[10px] mb-3">
                    {st.industry}
                  </Badge>
                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {st.description}
                  </p>

                  {st.problem && (
                    <div className="mt-3 p-2.5 bg-neutral-50 rounded-lg text-[11px] text-neutral-600 border border-neutral-100">
                      <span className="font-semibold text-neutral-800">Problem: </span>
                      {st.problem}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-neutral-400" />
                      {st._count?.members || st.members?.length || 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-neutral-400" />
                      {st._count?.milestones || st.milestones?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/startups/${st.slug}`}>
                      <Button size="sm" variant="ghost" className="text-xs hover:bg-neutral-100">
                        Overview
                      </Button>
                    </Link>
                    <Link href={`/startups/${st.slug}/workspace`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        Workspace &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
