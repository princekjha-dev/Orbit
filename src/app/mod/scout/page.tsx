import React from "react";
import Link from "next/link";
import { getScoutOpportunitiesForCandidate, getScoutMetrics } from "@/lib/scout/scout-service";
import { MatchBreakdownCard } from "@/components/scout/match-breakdown-card";
import { Compass, Users, Sparkles, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOT_AVATARS } from "@/lib/avatars";

export const metadata = {
  title: "Scout - Discovery & Matching | OrbitMod V5",
  description: "Auditable 5-signal deterministic opportunity matching and team pods.",
};

export default async function ScoutDiscoveryPage() {
  const metrics = await getScoutMetrics();
  // Candidate ID from demo session or fallback to Alex Chen
  const opportunities = await getScoutOpportunitiesForCandidate("candidate-alex-chen");

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl overflow-hidden border border-neutral-700 shadow-xs flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={DOT_AVATARS.Scout} alt="Scout" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    DOT 2: SCOUT
                  </span>
                  <span className="text-xs text-neutral-400">Deterministic Match Engine</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Scout: Verified Discovery & Team Pods
                </h1>
              </div>
            </div>
            <p className="text-sm text-neutral-300 max-w-2xl">
              Mathematically auditable 5-signal opportunity matching with transparent formula breakdowns.
              Every score is computed without black-box AI rankings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/mod/scout/team-builder">
              <Button className="bg-white text-neutral-900 hover:bg-neutral-100 flex items-center gap-2 font-semibold">
                <Users className="w-4 h-4 text-blue-600" />
                Team Builder Pods
              </Button>
            </Link>
            <Link href="/mod/scout/candidates">
              <Button variant="outline" className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Candidate Search
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-800">
          <div>
            <div className="text-2xl font-bold text-white">{metrics.activeOpportunities}</div>
            <div className="text-xs text-neutral-400">Active Opportunities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{metrics.activeCandidates}</div>
            <div className="text-xs text-neutral-400">Opted-In Candidates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{metrics.teamsFormed}</div>
            <div className="text-xs text-neutral-400">Active Team Pods</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{metrics.avgMatchScore}%</div>
            <div className="text-xs text-neutral-400">Mean Fit Score</div>
          </div>
        </div>
      </div>

      {/* Opportunities List with 5-Signal Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Ranked Opportunity Matches</h2>
            <p className="text-xs text-neutral-500">
              Evaluated using: 0.35·Skills + 0.25·Availability + 0.20·Role + 0.10·Timezone + 0.10·Evidence
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      {opp.organizationName}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mt-0.5">{opp.title}</h3>
                </div>

                <Link href={`/opportunities`}>
                  <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
                    View Opportunity <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {/* Match breakdown component */}
              <MatchBreakdownCard match={opp.match} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
