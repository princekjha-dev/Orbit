import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/quill/quill-service";
import { RubricEvaluatorCard } from "@/components/quill/rubric-evaluator-card";
import { ArrowLeft, BookOpen, ShieldCheck, Scale, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Assessment Workbench | Quill - OrbitMod V5",
  description: "Interactive assessment rubric and peer review workbench.",
};

export default async function AssessmentDetailPage(
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const assessment = await getAssessmentById(id);

  if (!assessment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/mod/quill">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5 text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Quill Hub
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-purple-100 text-purple-800">
            {assessment.category}
          </span>
          <span className="text-xs text-neutral-500 font-mono">Passing Threshold: {assessment.passingScore}%</span>
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          {assessment.title}
        </h1>
        <p className="text-xs text-neutral-600 max-w-2xl">
          {assessment.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rubric Interactive Studio */}
        <div className="lg:col-span-2 space-y-4">
          <RubricEvaluatorCard
            rubric={assessment.rubric}
            passingScore={assessment.passingScore}
          />
        </div>

        {/* Audit & Invariants Information */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-3 text-xs text-neutral-700">
            <div className="flex items-center gap-2 font-bold text-neutral-900">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Consensus & Verification Rules
            </div>
            <ul className="space-y-2 list-disc pl-4 text-neutral-600">
              <li>
                <strong>Minimum 2 Peer Reviews:</strong> Verifications require independent consensus before evidence issuance.
              </li>
              <li>
                <strong>Outlier Rejection:</strong> Reviews deviating by &gt;15 points from the median trigger supervisor review.
              </li>
              <li>
                <strong>Tamper Proof:</strong> Once passed, solutions are frozen and hashed with SHA-256 into the candidate&apos;s Evidence Passport.
              </li>
              <li>
                <strong>Non-Self Review:</strong> Candidates are cryptographically blocked from evaluating their own artifacts.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
