import React from "react";
import { MatchBreakdown } from "@/lib/scout/matching-engine";
import { Sparkles, CheckCircle2, Clock, Globe, ShieldCheck, Briefcase } from "lucide-react";

interface MatchBreakdownCardProps {
  match: MatchBreakdown;
  compact?: boolean;
}

export function MatchBreakdownCard({ match, compact = false }: MatchBreakdownCardProps) {
  const { totalScore, signals, explanation } = match;

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-800 border-emerald-300";
    if (score >= 60) return "bg-blue-50 text-blue-800 border-blue-300";
    if (score >= 40) return "bg-amber-50 text-amber-800 border-amber-300";
    return "bg-neutral-100 text-neutral-700 border-neutral-300";
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-base font-bold border ${getScoreBadgeColor(
                totalScore
              )}`}
            >
              {totalScore}% Match
            </span>
            <span className="text-xs text-neutral-500 font-medium">Deterministic Match Score</span>
          </div>
          <p className="text-xs text-neutral-600 mt-1 max-w-xl">{explanation}</p>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-600 border border-neutral-200">
            AUDITABLE FORMULA
          </span>
        </div>
      </div>

      {/* 5-Signal Breakdown Grid */}
      <div className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-5"}`}>
        {/* Signal 1: Skills (35%) */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-neutral-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Skills
            </span>
            <span className="font-mono text-neutral-500 text-[11px]">35% wt</span>
          </div>
          <div className="text-lg font-bold text-neutral-900">{signals.skillMatch.score}%</div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${signals.skillMatch.score}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-neutral-600">
            {signals.skillMatch.matchedSkills.length} matched / {signals.skillMatch.missingSkills.length} missing
          </div>
        </div>

        {/* Signal 2: Availability (25%) */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-neutral-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> Avail
            </span>
            <span className="font-mono text-neutral-500 text-[11px]">25% wt</span>
          </div>
          <div className="text-lg font-bold text-neutral-900">{signals.availability.score}%</div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${signals.availability.score}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-neutral-600">
            {signals.availability.candidateHours}h / {signals.availability.targetHours}h per week
          </div>
        </div>

        {/* Signal 3: Role (20%) */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-neutral-700 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Role
            </span>
            <span className="font-mono text-neutral-500 text-[11px]">20% wt</span>
          </div>
          <div className="text-lg font-bold text-neutral-900">{signals.interestRole.score}%</div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full"
              style={{ width: `${signals.interestRole.score}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-neutral-600">
            {signals.interestRole.matchedRole ? "Direct match" : "Related role"}
          </div>
        </div>

        {/* Signal 4: Timezone (10%) */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-neutral-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-600" /> Timezone
            </span>
            <span className="font-mono text-neutral-500 text-[11px]">10% wt</span>
          </div>
          <div className="text-lg font-bold text-neutral-900">{signals.timezone.score}%</div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-cyan-600 h-1.5 rounded-full"
              style={{ width: `${signals.timezone.score}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-neutral-600">
            Δ {signals.timezone.deltaHours}h offset
          </div>
        </div>

        {/* Signal 5: Evidence (10%) */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-neutral-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Evidence
            </span>
            <span className="font-mono text-neutral-500 text-[11px]">10% wt</span>
          </div>
          <div className="text-lg font-bold text-neutral-900">{signals.evidence.score}%</div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{ width: `${signals.evidence.score}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-neutral-600">
            {signals.evidence.verifiedEvidenceCount} verified artifacts
          </div>
        </div>
      </div>
    </div>
  );
}
