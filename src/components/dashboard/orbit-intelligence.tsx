"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  AlertCircle,
  Calendar,
  CheckCircle,
  Briefcase,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface Insight {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  actionLabel?: string;
}

interface Recommendation {
  opportunityId: string;
  title: string;
  organizationName: string;
  reason: string;
  matchingSkills: string[];
}

export function OrbitIntelligence() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/intelligence/insights");
        if (!res.ok) throw new Error("Failed to load intelligence");
        const json = await res.json();
        setInsights(json.insights || []);
        setRecommendations(json.recommendations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || (insights.length === 0 && recommendations.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-brand-600" />
          Orbit Intelligence
        </h2>
        <span className="text-[11px] text-neutral-400">
          Deterministic signals and explainable recommendations
        </span>
      </div>

      {/* Actionable Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-3.5 rounded-lg border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                  {insight.type === "DEADLINE" ? (
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-brand-600" />
                  )}
                  <span>{insight.title}</span>
                </div>
                <p className="text-neutral-600">{insight.message}</p>
              </div>

              {insight.link && (
                <Link href={insight.link}>
                  <Button size="sm" variant="outline" className="text-xs whitespace-nowrap">
                    <span>{insight.actionLabel || "View"}</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Explainable Opportunity Matches */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <Card
              key={rec.opportunityId}
              className="p-3.5 bg-white border-neutral-200 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    {rec.organizationName}
                  </span>
                  <Badge variant="blue" className="text-[10px]">
                    Matched Skill
                  </Badge>
                </div>
                <h4 className="font-semibold text-neutral-900 text-xs">
                  {rec.title}
                </h4>
                <p className="text-[11px] text-neutral-600 mt-1 italic">
                  &ldquo;{rec.reason}&rdquo;
                </p>
              </div>

              <Link href={`/opportunities/${rec.opportunityId}`}>
                <Button size="sm" variant="outline" className="w-full text-xs py-1">
                  View Match
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
