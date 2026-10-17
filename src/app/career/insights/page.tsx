"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  FolderKanban,
  Users,
  Compass,
  Briefcase,
  Share2,
  Sparkles,
  ArrowRight,
  Plus,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TrustCategory {
  category: string;
  status: "VERIFIED" | "ACTIVE" | "PENDING" | "UNVERIFIED" | "INACTIVE";
  detail: string;
}

interface CareerMoment {
  id: string;
  momentType: string;
  title: string;
  description: string;
  date: string;
  isPublic: boolean;
}

interface EligibleMoment {
  momentType: string;
  title: string;
  description: string;
  date: string;
  referenceId?: string;
}

export default function CareerInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [trustCategories, setTrustCategories] = useState<TrustCategory[]>([]);
  const [statements, setStatements] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [recordedMoments, setRecordedMoments] = useState<CareerMoment[]>([]);
  const [eligibleMoments, setEligibleMoments] = useState<EligibleMoment[]>([]);
  const [recordingType, setRecordingType] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [insightsRes, momentsRes] = await Promise.all([
          fetch("/api/talent/insights"),
          fetch("/api/career/moments"),
        ]);

        if (insightsRes.ok) {
          const insights = await insightsRes.json();
          setTrustCategories(insights.trustCategories || []);
          setStatements(insights.dataBackedStatements || []);
          setMetrics(insights.metrics || {});
        }

        if (momentsRes.ok) {
          const moments = await momentsRes.json();
          setRecordedMoments(moments.recordedMoments || []);
          setEligibleMoments(moments.eligibleDetected || []);
        }
      } catch (err) {
        console.error("Error loading insights:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleRecordMoment = async (moment: EligibleMoment) => {
    try {
      setRecordingType(moment.momentType);
      const res = await fetch("/api/career/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          momentType: moment.momentType,
          title: moment.title,
          description: moment.description,
          date: moment.date,
          referenceId: moment.referenceId,
          isPublic: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecordedMoments((prev) => [...prev, data.moment]);
        setEligibleMoments((prev) => prev.filter((m) => m.momentType !== moment.momentType));
      }
    } catch (err) {
      console.error("Failed to record moment:", err);
    } finally {
      setRecordingType(null);
    }
  };

  const getStatusBadge = (status: TrustCategory["status"]) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="green">Verified</Badge>;
      case "ACTIVE":
        return <Badge variant="blue">Active</Badge>;
      case "PENDING":
        return <Badge variant="amber">Pending</Badge>;
      default:
        return <Badge variant="neutral">No Data Yet</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-neutral-800" />
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Career Insights & Trust</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Private, data-backed assessment of your demonstrated skills, verified evidence, and career moments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/evidence/timeline">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1.5" />
              Evidence Timeline
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-neutral-500 text-sm">
          Loading personal career insights...
        </div>
      ) : (
        <>
          {/* Grounded Data-Backed Statements */}
          <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
              Demonstrated Capabilities
            </h2>
            {statements.length === 0 ? (
              <p className="text-xs text-neutral-500">
                No verified work or project evidence recorded yet. Participate in projects or verify completed deliverables to unlock capabilities.
              </p>
            ) : (
              <div className="space-y-2">
                {statements.map((stmt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 bg-white p-3 rounded-lg border border-neutral-200/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{stmt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inspectable Trust Without An Arbitrary Score */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Inspectable Trust Categories</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Orbit evaluates reputation through real, inspectable evidence rather than an arbitrary numerical score.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trustCategories.map((cat) => (
                <div
                  key={cat.category}
                  className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-neutral-900">{cat.category}</span>
                    {getStatusBadge(cat.status)}
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">{cat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Meaningful Career Moments */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Career Moments</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Meaningful milestones generated directly from your Orbit activity.
              </p>
            </div>

            {/* Detected eligible moments to confirm */}
            {eligibleMoments.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-semibold text-amber-900">
                  Unrecorded Milestones Detected from Your Activity
                </span>
                <div className="space-y-2">
                  {eligibleMoments.map((m) => (
                    <div
                      key={m.momentType}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-amber-200"
                    >
                      <div>
                        <span className="text-xs font-bold text-neutral-900">{m.title}</span>
                        <p className="text-xs text-neutral-600 mt-0.5">{m.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRecordMoment(m)}
                        disabled={recordingType === m.momentType}
                        className="text-xs flex-shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Record Milestone
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recorded career moments */}
            {recordedMoments.length === 0 && eligibleMoments.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-500 text-xs">
                No career moments recorded yet. Complete projects or hackathons to document your journey.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recordedMoments.map((rm) => (
                  <div key={rm.id} className="p-4 rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between">
                      <Badge variant="blue">
                        {rm.momentType.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[11px] text-neutral-400">{formatDate(rm.date)}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-neutral-900">{rm.title}</h3>
                    <p className="mt-1 text-xs text-neutral-600">{rm.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
