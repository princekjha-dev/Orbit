"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Compass,
  ShieldCheck,
  Award,
  Sparkles,
  MessageSquare,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

import { getDotAvatar } from "@/lib/avatars";

export function CoreLoopStepper() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      num: 1,
      name: "Discover (Space)",
      icon: Compass,
      description: "Join verified community spaces to discover authentic builders, opportunities, and hackathons.",
      targetUrl: "/mod/spaces",
      badge: "Shared Foundation",
    },
    {
      num: 2,
      name: "Verify (Avis)",
      icon: ShieldCheck,
      dot: "avis",
      description: "Perform DNS TXT challenge resolution and recruiter email domain matching. Zero fake trust.",
      targetUrl: "/mod/avis",
      badge: "DOT 1: AVIS",
    },
    {
      num: 3,
      name: "Prove (Quill)",
      icon: Award,
      dot: "quill",
      description: "Submit assessment artifacts evaluated on standardized rubrics; hash with SHA-256.",
      targetUrl: "/mod/quill",
      badge: "DOT 3: QUILL",
    },
    {
      num: 4,
      name: "Match (Scout)",
      icon: Sparkles,
      dot: "scout",
      description: "Compute auditable 5-signal match scores and allocate balanced pod slots without duplicate assignments.",
      targetUrl: "/mod/scout",
      badge: "DOT 2: SCOUT",
    },
    {
      num: 5,
      name: "Collaborate (Relay)",
      icon: MessageSquare,
      dot: "relay",
      description: "Collaborate in monitored pod channels with live off-platform contact detection and Community Notes.",
      targetUrl: "/mod/relay",
      badge: "DOT 4: RELAY",
    },
    {
      num: 6,
      name: "Build Evidence (Passport)",
      icon: FileCheck2,
      description: "Aggregate verified project outcomes, peer attestations, and export W3C JSON-LD credentials.",
      targetUrl: "/mod/passport",
      badge: "Evidence Passport",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {steps.map((s) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? "border-blue-600 bg-blue-50/70 shadow-xs"
                  : isDone
                  ? "border-emerald-300 bg-emerald-50/50"
                  : "border-neutral-200 bg-white opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={isCurrent ? "text-blue-700" : isDone ? "text-emerald-700" : "text-neutral-500"}>
                  Step {s.num}
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="text-xs font-semibold text-neutral-900 mt-1 truncate">{s.name}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase */}
      {(() => {
        const step = steps[currentStep - 1];
        const Icon = step.icon;

        return (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                {step.dot ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 flex items-center justify-center shadow-xs shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getDotAvatar(step.dot)}
                      alt={step.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {step.badge}
                  </span>
                  <h2 className="text-xl font-extrabold text-neutral-900 mt-1">
                    Step {step.num}: {step.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep((c) => Math.max(1, c - 1))}
                    className="text-xs"
                  >
                    Previous Step
                  </Button>
                )}
                {currentStep < 6 ? (
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep((c) => Math.min(6, c + 1))}
                    className="text-xs flex items-center gap-1"
                  >
                    Next Step <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Link href="/mod/passport">
                    <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                      View Final Passport
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <p className="text-sm text-neutral-700 leading-relaxed max-w-2xl">
              {step.description}
            </p>

            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs text-neutral-500">
                Live interactive module route: <code className="font-mono text-neutral-800">{step.targetUrl}</code>
              </div>
              <Link href={step.targetUrl}>
                <Button className="flex items-center gap-2 text-xs">
                  Launch {step.name} Module <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
