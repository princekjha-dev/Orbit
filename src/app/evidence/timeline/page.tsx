"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ShieldCheck,
  ExternalLink,
  FolderKanban,
  Award,
  ArrowLeft,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  type: "PROJECT" | "OUTCOME" | "HACKATHON" | "CREDENTIAL";
  organizationName?: string | null;
  role?: string | null;
  description?: string | null;
  date: string;
  year: number;
  evidenceUrl?: string | null;
  verified: boolean;
}

export default function EvidenceTimelinePage() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [byYear, setByYear] = useState<Record<number, TimelineItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const res = await fetch("/api/evidence/timeline");
        if (!res.ok) throw new Error("Failed to load timeline");
        const json = await res.json();
        setTimeline(json.timeline || []);
        setByYear(json.byYear || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, []);

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/profile"
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Profile
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-neutral-800" />
              Verified Evidence Timeline
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Chronological proof of projects delivered, hackathons submitted, and milestones completed.
            </p>
          </div>

          <Badge variant="green" className="text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            {timeline.length} Milestones
          </Badge>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-neutral-500">
            Loading evidence timeline...
          </div>
        ) : timeline.length === 0 ? (
          <Card className="p-12 text-center bg-white border-neutral-200">
            <Clock className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
            <h2 className="text-base font-semibold text-neutral-900">
              No timeline milestones yet
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Complete scoped projects, submit hackathon solutions, or earn verified work records to build your timeline.
            </p>
            <Link href="/projects">
              <Button size="sm" className="mt-4">
                Explore Projects
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {years.map((year) => (
              <div key={year} className="space-y-4">
                {/* Year Marker */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-900 bg-neutral-200/80 px-2.5 py-0.5 rounded">
                    {year}
                  </span>
                  <div className="h-px bg-neutral-200 flex-1" />
                </div>

                {/* Items in that Year */}
                <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-neutral-200">
                  {byYear[year].map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 bg-white border-neutral-200 shadow-sm space-y-2 relative"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-900 text-sm">
                              {item.title}
                            </h3>
                            <Badge variant={item.type === "PROJECT" ? "green" : item.type === "HACKATHON" ? "purple" : "blue"}>
                              {item.type}
                            </Badge>
                          </div>
                          {item.organizationName && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {item.organizationName}
                              {item.role && ` - Role: ${item.role}`}
                            </p>
                          )}
                        </div>

                        <span className="text-[11px] text-neutral-400 font-medium flex-shrink-0">
                          {formatDate(item.date)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-neutral-700 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {item.evidenceUrl && (
                        <div className="pt-2 flex justify-end">
                          <a
                            href={item.evidenceUrl}
                            target={item.evidenceUrl.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                          >
                            <span>Inspect Verification</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
