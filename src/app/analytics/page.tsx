"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Briefcase,
  FolderKanban,
  CheckCircle,
  FileText,
  Users,
  ShieldCheck,
  Building,
} from "lucide-react";

interface AnalyticsData {
  talent: {
    totalApplications: number;
    interviewCount: number;
    selectedCount: number;
    completedWorkCount: number;
    completedProjectsCount: number;
    totalEvidences: number;
    verifiedEvidenceCount: number;
  };
  organization: {
    totalOpportunities: number;
    totalOrgApplications: number;
    totalShortlists: number;
    totalCandidatesTracked: number;
    totalOrgProjects: number;
    completedOrgProjects: number;
    completionRate: string | null;
  } | null;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-5">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-neutral-800" />
            Activity Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real metrics derived directly from your authenticated Orbit records. No fabricated data or vanity metrics.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-neutral-500">
            Loading analytics...
          </div>
        ) : !data ? (
          <Card className="p-8 text-center text-xs text-neutral-500 bg-white">
            Unable to load analytics data.
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Talent Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-neutral-700" />
                  Talent & Contributor Activity
                </h2>
                <span className="text-xs text-neutral-400">
                  Individual Record
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-white border-neutral-200 space-y-2">
                  <p className="text-xs text-neutral-500 font-medium">
                    Applications Submitted
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {data.talent.totalApplications > 0
                      ? data.talent.totalApplications
                      : "No data yet"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Across jobs and projects
                  </p>
                </Card>

                <Card className="p-4 bg-white border-neutral-200 space-y-2">
                  <p className="text-xs text-neutral-500 font-medium">
                    Interviews & Shortlists
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {data.talent.interviewCount > 0
                      ? data.talent.interviewCount
                      : "No data yet"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Advances in recruiter pipelines
                  </p>
                </Card>

                <Card className="p-4 bg-white border-neutral-200 space-y-2">
                  <p className="text-xs text-neutral-500 font-medium">
                    Verified Work Records
                  </p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {data.talent.completedWorkCount > 0
                      ? data.talent.completedWorkCount
                      : "No data yet"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Attributable completed projects
                  </p>
                </Card>

                <Card className="p-4 bg-white border-neutral-200 space-y-2">
                  <p className="text-xs text-neutral-500 font-medium">
                    Skill Evidence Artifacts
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {data.talent.totalEvidences > 0
                      ? data.talent.totalEvidences
                      : "No data yet"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {data.talent.verifiedEvidenceCount} verified by organizations
                  </p>
                </Card>
              </div>
            </section>

            {/* Organization Section */}
            {data.organization && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Building className="h-4 w-4 text-neutral-700" />
                    Organization & Hiring Metrics
                  </h2>
                  <span className="text-xs text-neutral-400">
                    Organization Workspace
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4 bg-white border-neutral-200 space-y-2">
                    <p className="text-xs text-neutral-500 font-medium">
                      Active Opportunities
                    </p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {data.organization.totalOpportunities > 0
                        ? data.organization.totalOpportunities
                        : "No data yet"}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Published opportunities
                    </p>
                  </Card>

                  <Card className="p-4 bg-white border-neutral-200 space-y-2">
                    <p className="text-xs text-neutral-500 font-medium">
                      Applications Received
                    </p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {data.organization.totalOrgApplications > 0
                        ? data.organization.totalOrgApplications
                        : "No data yet"}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Total candidate applications
                    </p>
                  </Card>

                  <Card className="p-4 bg-white border-neutral-200 space-y-2">
                    <p className="text-xs text-neutral-500 font-medium">
                      Candidates in Pipelines
                    </p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {data.organization.totalCandidatesTracked > 0
                        ? data.organization.totalCandidatesTracked
                        : "No data yet"}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Across {data.organization.totalShortlists} shortlists
                    </p>
                  </Card>

                  <Card className="p-4 bg-white border-neutral-200 space-y-2">
                    <p className="text-xs text-neutral-500 font-medium">
                      Project Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {data.organization.completionRate ?? "No data yet"}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {data.organization.completedOrgProjects} of {data.organization.totalOrgProjects} scoped projects
                    </p>
                  </Card>
                </div>
              </section>
            )}

            {/* Ground Truth Guarantee */}
            <Card className="p-5 bg-neutral-100 border-neutral-200 text-xs text-neutral-600 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-neutral-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Strict Real-Data Policy</span>
              </div>
              <p>
                Orbit never manufactures numbers, projects fictitious views, or constructs arbitrary engagement scores. Every statistic shown above represents a tangible record in the database.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
