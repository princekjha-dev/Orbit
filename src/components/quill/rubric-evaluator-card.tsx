"use client";

import React, { useState } from "react";
import { RubricCriterion, calculateRubricScore } from "@/lib/quill/quill-engine";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, AlertTriangle, Scale } from "lucide-react";

interface RubricEvaluatorCardProps {
  rubric: RubricCriterion[];
  passingScore?: number;
  onSubmitEvaluation?: (scores: Array<{ criterionId: string; score: number }>) => void;
}

export function RubricEvaluatorCard({
  rubric,
  passingScore = 70,
  onSubmitEvaluation,
}: RubricEvaluatorCardProps) {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const c of rubric) {
      initial[c.id] = 4; // Default solid rating
    }
    return initial;
  });

  const evaluationItems = rubric.map((c) => ({
    criterionId: c.id,
    score: scores[c.id] ?? 1,
  }));

  const result = calculateRubricScore(rubric, evaluationItems, passingScore);

  const handleScoreChange = (critId: string, val: number) => {
    setScores((prev) => ({ ...prev, [critId]: val }));
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-neutral-900">Standardized Rubric Evaluator</h3>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            100% deterministic rubric. Criteria weights sum to 1.00; evaluated on 1–5 scale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span
              className={`text-lg font-extrabold ${
                result.passed ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {result.totalScore}%
            </span>
            <div className="text-[10px] text-neutral-500 font-mono">PASS: {passingScore}%</div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              result.passed
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}
          >
            {result.passed ? "PASSED" : "NEEDS REVISION"}
          </span>
        </div>
      </div>

      {/* Criteria Sliders */}
      <div className="space-y-4">
        {rubric.map((crit) => {
          const currentVal = scores[crit.id] ?? 1;
          const detail = result.breakdown.find((b) => b.criterionId === crit.id);

          return (
            <div key={crit.id} className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-neutral-900">{crit.name}</div>
                  <div className="text-[11px] text-neutral-500">{crit.description}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-neutral-800">{currentVal} / {crit.maxScore}</span>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    Weight: {Math.round(crit.weight * 100)}% ({detail?.weightedPoints ?? 0} pts)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="1"
                  max={crit.maxScore}
                  step="1"
                  value={currentVal}
                  onChange={(e) => handleScoreChange(crit.id, parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      {onSubmitEvaluation && (
        <div className="pt-2 flex justify-end">
          <Button
            size="sm"
            onClick={() => onSubmitEvaluation(evaluationItems)}
            className="flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Submit Audited Review
          </Button>
        </div>
      )}
    </div>
  );
}
