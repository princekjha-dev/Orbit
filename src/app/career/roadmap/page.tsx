"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Compass,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FolderKanban,
  Briefcase,
  Target,
  Sparkles,
} from "lucide-react";

interface RoadmapData {
  targetRole: string;
  availableRoles: string[];
  currentEvidenceSkills: string[];
  missingEvidenceSkills: string[];
  recommendedMilestones: string[];
  matchingOpportunities: {
    id: string;
    title: string;
    type: string;
    orgName: string;
    skills: string[];
  }[];
  verifiedProjectsCount: number;
  totalEvidenceCount: number;
}

export default function CareerRoadmapPage() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("Frontend Engineer");

  useEffect(() => {
    loadRoadmap(selectedRole);
  }, [selectedRole]);

  async function loadRoadmap(role: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/career/roadmap?targetRole=${encodeURIComponent(role)}`);
      if (!res.ok) throw new Error("Failed to load career roadmap");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectRole(role: string) {
    setSelectedRole(role);
    try {
      await fetch("/api/career/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: role }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-5">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Compass className="h-6 w-6 text-neutral-800" />
            Personal Career Roadmap
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Compare your actual Orbit verified evidence against target milestones. Grounded in real projects and verified artifacts.
          </p>
        </div>

        {/* Target Direction Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Select Your Target Trajectory
          </label>
          <div className="flex flex-wrap gap-2">
            {data?.availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => handleSelectRole(role)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  selectedRole === role
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-neutral-500">
            Computing career gap analysis from your evidence records...
          </div>
        ) : !data ? (
          <Card className="p-8 text-center text-xs text-neutral-500 bg-white">
            Unable to load career data.
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Banner */}
            <Card className="p-5 bg-white border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Target Trajectory
                  </span>
                  <h2 className="text-xl font-bold text-neutral-900 mt-0.5">
                    {data.targetRole}
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1">
                    Orbit verified foundation: {data.verifiedProjectsCount} verified project{data.verifiedProjectsCount === 1 ? "" : "s"} and {data.totalEvidenceCount} evidence artifact{data.totalEvidenceCount === 1 ? "" : "s"}.
                  </p>
                </div>

                <Link href="/profile">
                  <Button size="sm" variant="outline">
                    Update Evidence Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Evidence Comparison Grid: Current vs Missing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Evidence */}
              <Card className="p-5 bg-white border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Current Evidence
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold">
                    {data.currentEvidenceSkills.length} Verified
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Skills you have demonstrated through completed projects or public evidence:
                </p>

                {data.currentEvidenceSkills.length === 0 ? (
                  <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-500 text-center">
                    No verified evidence logged yet for this role.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.currentEvidenceSkills.map((skill) => (
                      <Badge key={skill} variant="green">
                        <CheckCircle className="h-3 w-3 mr-1 inline" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>

              {/* Missing Evidence Gaps */}
              <Card className="p-5 bg-white border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Missing Evidence Gaps
                  </h3>
                  <span className="text-xs text-amber-700 font-semibold">
                    {data.missingEvidenceSkills.length} Needed
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Core competencies without verified proof on your Orbit record:
                </p>

                {data.missingEvidenceSkills.length === 0 ? (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                    All core target skills have verified proof on your profile!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.missingEvidenceSkills.map((skill) => (
                      <Badge key={skill} variant="amber">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Actionable Next Steps (Recommended Milestones) */}
            <Card className="p-5 bg-white border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-neutral-800" />
                  Recommended Actionable Next Steps
                </h3>
                <span className="text-[11px] text-neutral-400">
                  Clearly labeled evidence goals
                </span>
              </div>

              <div className="space-y-2.5">
                {data.recommendedMilestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 text-xs text-neutral-800"
                  >
                    <span className="h-5 w-5 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      {index + 1}
                    </span>
                    <p className="leading-relaxed pt-0.5">{milestone}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Suggested Real Orbit Opportunities */}
            {data.matchingOpportunities.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-neutral-800" />
                  Relevant Orbit Opportunities to Bridge Evidence Gaps
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.matchingOpportunities.map((opp) => (
                    <Card key={opp.id} className="p-4 bg-white border-neutral-200 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Badge variant="neutral">
                            {opp.type.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-neutral-500 font-medium">
                            {opp.orgName}
                          </span>
                        </div>
                        <h4 className="font-semibold text-neutral-900 text-sm">
                          {opp.title}
                        </h4>
                        {opp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {opp.skills.map((s) => (
                              <Badge key={s} variant="neutral" className="text-[10px]">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Link href={`/opportunities/${opp.id}`}>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <span>View Opportunity</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
