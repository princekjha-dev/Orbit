import React from "react";
import Link from "next/link";
import { getTeam, getAllTeams } from "@/lib/scout/scout-service";
import { TeamBuilderClient } from "@/components/scout/team-builder-client";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Team Builder Pods | Scout - OrbitMod V5",
  description: "Greedy bipartite slot allocation for balanced, high-coverage builder pods.",
};

export default async function TeamBuilderPage() {
  const teams = getAllTeams();
  const defaultTeam = teams[0] || (await getTeam("team-nexus-demo"));

  if (!defaultTeam) {
    return <div>No team pods found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/mod/scout">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5 text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Scout Discovery
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-purple-100 text-purple-800">
            TEAM PODS
          </span>
          <span className="text-xs text-neutral-500">Bipartite Slot Allocation</span>
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Pod Composer & Slot Allocation Studio
        </h1>
        <p className="text-xs text-neutral-600 max-w-2xl">
          Construct balanced teams by mapping complementary candidate skills to required pod slots.
          Guarantees zero-duplicate assignment with transparent fit metrics.
        </p>
      </div>

      <TeamBuilderClient initialTeam={defaultTeam} />
    </div>
  );
}
