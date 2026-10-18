import React from "react";
import Link from "next/link";
import { getAssessments, getAllEvidenceArtifacts, getQuillMetrics } from "@/lib/quill/quill-service";
import { EvidenceArtifactCard } from "@/components/quill/evidence-artifact-card";
import { Award, BookOpen, Plus, CheckCircle, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Quill - Skills, Assessments & Evidence | OrbitMod V5",
  description: "Standardized ESCO skills taxonomy, rubric-based evaluations, and cryptographic evidence artifacts.",
};

export default async function QuillHubPage() {
  const metrics = await getQuillMetrics();
  const assessments = await getAssessments();
  const artifacts = await getAllEvidenceArtifacts();

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                DOT 3: QUILL
              </span>
              <span className="text-xs text-neutral-400">Skills, Assessments & Evidence</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Quill: Standardized Proof of Work
            </h1>
            <p className="text-sm text-neutral-300 max-w-2xl">
              Deterministic rubric scoring, ESCO skills taxonomy normalization, and tamper-proof SHA-256 evidence generation.
              Never black-box AI grades.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/mod/quill/evidence/new">
              <Button className="bg-white text-neutral-900 hover:bg-neutral-100 flex items-center gap-2 font-semibold">
                <Plus className="w-4 h-4 text-purple-600" />
                Submit Evidence Artifact
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-800">
          <div>
            <div className="text-2xl font-bold text-white">{metrics.totalAssessments}</div>
            <div className="text-xs text-neutral-400">Standardized Assessments</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{metrics.verifiedArtifactsCount}</div>
            <div className="text-xs text-neutral-400">Verified Evidence Artifacts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{metrics.averageScore}%</div>
            <div className="text-xs text-neutral-400">Average Rubric Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{metrics.normalizedSkillsCount}</div>
            <div className="text-xs text-neutral-400">Normalized ESCO Skills</div>
          </div>
        </div>
      </div>

      {/* Standardized Assessments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Standardized Skill Assessments</h2>
            <p className="text-xs text-neutral-500">
              Evaluated against transparent, weighted rubrics by independent peer reviewers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {a.category}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    Pass: {a.passingScore}%
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{a.title}</h3>
                <p className="text-xs text-neutral-600">{a.description}</p>

                <div className="pt-2 text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-700">Rubric Dimensions: </span>
                  {a.rubric.map((r) => r.name).join(" • ")}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-xs text-neutral-500">
                  {a.submissionsCount} submissions reviewed
                </span>
                <Link href={`/mod/quill/assessments/${a.id}`}>
                  <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" /> View Rubric & Workbench
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verifiable Evidence Artifacts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Cryptographically Auditable Evidence</h2>
            <p className="text-xs text-neutral-500">
              Artifacts hashed with SHA-256 for mathematical proof of work and tamper-detection.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artifacts.map((art) => (
            <EvidenceArtifactCard key={art.id} artifact={art} />
          ))}
        </div>
      </div>
    </div>
  );
}
