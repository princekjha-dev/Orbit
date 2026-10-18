import React from "react";
import Link from "next/link";
import { getScoutCandidatesForOpportunity } from "@/lib/scout/scout-service";
import { ArrowLeft, Shield, Clock, Globe, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Candidate Search & Exposure Tracker | Scout - OrbitMod V5",
  description: "Candidate discovery directory with anti-scraping fair exposure tracking.",
};

export default async function ScoutCandidatesPage() {
  const recruiterId = "recruiter-apex-demo";
  const { candidates, remainingReveals, resetsInHours } = await getScoutCandidatesForOpportunity(
    "demo-opp-fullstack-001",
    recruiterId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/mod/scout">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5 text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Scout Discovery
          </Button>
        </Link>
      </div>

      {/* Fair Exposure Tracker Bar */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-900">Fair Exposure & Anti-Scraping Protection Active</span>
          </div>
          <p className="text-xs text-blue-800 max-w-xl">
            To protect builder privacy and prevent predatory headhunting, recruiter candidate reveals are bounded to 50 profiles per 24-hour cycle.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-blue-200 p-3 text-right shrink-0">
          <div className="text-lg font-extrabold text-blue-950">{remainingReveals} / 50</div>
          <div className="text-[11px] text-blue-700 font-medium">Reveals Remaining ({resetsInHours}h reset)</div>
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Opted-In Talent Pool</h2>
          <span className="text-xs text-neutral-500">Showing {candidates.length} verified candidates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{candidate.name}</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">{candidate.headline}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {candidate.match.totalScore}% Fit
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {candidate.skills.map((s) => (
                  <span
                    key={s.name}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                      s.verified
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-neutral-50 text-neutral-700 border-neutral-200"
                    }`}
                  >
                    {s.name} {s.verified && "✓"}
                  </span>
                ))}
              </div>

              {/* Meta metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{candidate.availabilityHoursPerWeek}h/wk</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  <span>UTC {candidate.timezoneOffsetHours >= 0 ? `+${candidate.timezoneOffsetHours}` : candidate.timezoneOffsetHours}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{candidate.evidenceCount} evidence</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/mod/scout/team-builder`}>
                  <Button size="sm" variant="outline" className="w-full text-xs h-7">
                    Invite to Pod Slot
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
