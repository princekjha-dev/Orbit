"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TrendingUp,
  Award,
  Briefcase,
  Calendar,
  Code2,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export function GrowthDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/growth")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading growth data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded-sm w-1/4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Could not load activity records"
        description="Please sign in to view your verified work, completed projects, and skill progress."
        action={
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        }
      />
    );
  }

  const { metrics, verifiedWork, completedProjects, events, hackathons, mentorshipSessions, skillsPracticed, timeline } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-brand-600" />
          Personal Growth & Track Record
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          A factual, private record of completed work, verified evidence, skills practiced, and ecosystem participation.
        </p>
      </div>

      {/* Real Counts - Honest Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-white border border-neutral-200 text-center">
          <p className="text-2xl font-bold text-neutral-900">{metrics.verifiedWorkCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Verified Work</p>
        </Card>
        <Card className="p-3.5 bg-white border border-neutral-200 text-center">
          <p className="text-2xl font-bold text-neutral-900">{metrics.completedProjectsCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Projects Done</p>
        </Card>
        <Card className="p-3.5 bg-white border border-neutral-200 text-center">
          <p className="text-2xl font-bold text-neutral-900">{metrics.skillsCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Skills Used</p>
        </Card>
        <Card className="p-3.5 bg-white border border-neutral-200 text-center">
          <p className="text-2xl font-bold text-neutral-900">{metrics.eventsAttendedCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Events Attended</p>
        </Card>
        <Card className="p-3.5 bg-white border border-neutral-200 text-center">
          <p className="text-2xl font-bold text-neutral-900">{metrics.hackathonsCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Hackathons</p>
        </Card>
        <Card className="p-3.5 bg-white border border-neutral-200 text-center">
          <p className="text-2xl font-bold text-neutral-900">{metrics.mentorshipCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Advisory Sessions</p>
        </Card>
      </div>

      {/* Main Grid: Left side Verified & Projects, Right side Skills & Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real Proof */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verified Work Records */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Verified Work Records ({verifiedWork.length})
              </h2>
              <Link href="/verified-work" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                View Proofs &rarr;
              </Link>
            </div>

            {verifiedWork.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">
                No verified work records issued yet. Complete organization projects or validated deliverables to earn verifiable credentials.
              </p>
            ) : (
              <div className="space-y-3">
                {verifiedWork.map((vw: any) => (
                  <div
                    key={vw.id}
                    className="p-3.5 bg-neutral-50 border border-neutral-100 rounded-lg flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{vw.title}</p>
                      <p className="text-xs text-neutral-600 mt-0.5">{vw.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400">
                        <span>Issued: {new Date(vw.completionDate).toLocaleDateString()}</span>
                        {vw.verificationHash && (
                          <span className="font-mono bg-neutral-200 px-1 py-0.5 rounded text-neutral-700">
                            Hash: {vw.verificationHash.slice(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="green" className="text-[10px]">Verified</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Projects */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand-600" />
                Completed Projects ({completedProjects.length})
              </h2>
              <Link href="/projects" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Browse Projects &rarr;
              </Link>
            </div>

            {completedProjects.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">
                No completed projects recorded. Apply to active project briefs from organizations and startups.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {completedProjects.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{p.title}</p>
                      <p className="text-xs text-neutral-500">Org: {p.org}</p>
                      {p.deliverable && (
                        <p className="text-xs text-neutral-700 mt-1 line-clamp-1">Deliverable: {p.deliverable}</p>
                      )}
                    </div>
                    <Badge variant="blue" className="text-[10px]">{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-neutral-500" />
              Chronological Activity Log
            </h2>

            {timeline.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">No recent logged activity.</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-neutral-900 font-medium">{act.title}</p>
                      {act.description && <p className="text-neutral-500 mt-0.5">{act.description}</p>}
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {new Date(act.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Skills, Advisory & Events */}
        <div className="space-y-6">
          {/* Skills Practiced */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-brand-600" />
              Skills Applied in Real Work
            </h2>
            {skillsPracticed.length === 0 ? (
              <p className="text-xs text-neutral-500">No skills associated with your profile or projects yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {skillsPracticed.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-md border border-neutral-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Mentorship Sessions */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-brand-600" />
                Mentorship Sessions
              </h2>
              <Link href="/mentorship" className="text-xs font-medium text-brand-600 hover:underline">
                Hub &rarr;
              </Link>
            </div>

            {mentorshipSessions.length === 0 ? (
              <p className="text-xs text-neutral-500">No completed advisory sessions.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {mentorshipSessions.map((s: any) => (
                  <div key={s.id} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="flex justify-between items-center font-medium text-neutral-900">
                      <span>{s.role === "MENTOR" ? "Mentored" : "Advised by"} {s.partnerName}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(s.scheduledAt).toLocaleDateString()}
                      </span>
                    </div>
                    {s.actionItems && (
                      <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2">
                        Action: {s.actionItems}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events & Hackathons */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-600" />
              Events & Hackathons
            </h2>

            <div className="space-y-2 text-xs">
              {events.slice(0, 3).map((e: any) => (
                <div key={e.id} className="flex justify-between items-center text-neutral-700">
                  <span className="truncate">{e.title}</span>
                  <span className="text-[10px] text-neutral-400 shrink-0">
                    {new Date(e.startDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {hackathons.slice(0, 3).map((h: any) => (
                <div key={h.id} className="flex justify-between items-center text-neutral-700">
                  <span className="truncate">Team: {h.teamName}</span>
                  <span className="text-[10px] font-medium text-emerald-600 shrink-0">
                    {h.hasSubmission ? "Submitted" : "Participated"}
                  </span>
                </div>
              ))}
              {events.length === 0 && hackathons.length === 0 && (
                <p className="text-xs text-neutral-500">No attended events or hackathons.</p>
              )}
            </div>
          </div>

          {/* Next Steps Prompt */}
          <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
            <p className="text-xs font-bold text-brand-900">What opportunity should you pursue next?</p>
            <p className="text-xs text-brand-700 mt-1">
              Leverage your verified work to apply for higher-impact startup roles or propose an idea to co-founders.
            </p>
            <div className="mt-3 flex gap-2">
              <Link href="/opportunities">
                <Button size="sm" variant="primary" className="text-xs">Explore Opportunities</Button>
              </Link>
              <Link href="/ideas/new">
                <Button size="sm" variant="outline" className="text-xs">Post an Idea</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
