"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Briefcase,
  FolderKanban,
  ShieldCheck,
  Check,
} from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  actionUrl: string;
  priority: "HIGH" | "NORMAL" | "LOW";
  category: string;
  createdAt: string;
}

export default function ActionCenterPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadActions() {
      try {
        const res = await fetch("/api/action-center");
        if (!res.ok) throw new Error("Failed to load actions");
        const json = await res.json();
        setActions(json.actions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadActions();
  }, []);

  const filtered = actions.filter((a) => {
    if (filter === "ALL") return true;
    return a.priority === filter;
  });

  const priorityBadge = (p: string) => {
    switch (p) {
      case "HIGH":
        return <Badge variant="red">High Priority</Badge>;
      case "NORMAL":
        return <Badge variant="blue">Normal Priority</Badge>;
      default:
        return <Badge variant="neutral">Low Priority</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Bell className="h-6 w-6 text-neutral-800" />
              Action Center
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Unified inbox of real operational tasks, pending reviews, and milestone deadlines. No gamified urgency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Filter:</span>
            <div className="flex gap-1">
              {["ALL", "HIGH", "NORMAL", "LOW"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    filter === lvl
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-neutral-500">
            Checking operational signals across projects, applications, and verifications...
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center bg-white border-neutral-200 space-y-2">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
            <h2 className="text-base font-bold text-neutral-900">
              All caught up
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              There are no pending action items requiring your attention right now.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((action) => (
              <Card
                key={action.id}
                className="p-5 bg-white border-neutral-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {priorityBadge(action.priority)}
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      {action.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-neutral-900 text-sm">
                    {action.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={action.actionUrl}>
                    <Button size="sm" className="text-xs">
                      <span>Take Action</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
