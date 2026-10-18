import React from "react";
import Link from "next/link";
import { CoreLoopStepper } from "@/components/orbitmod/core-loop-stepper";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Core Loop Runner | OrbitMod V5",
  description: "End-to-end interactive execution of the OrbitMod V5 Core Loop.",
};

export default function CoreLoopPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/mod">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5 text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to OrbitMod Console
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800">
            ORBITMOD V5
          </span>
          <span className="text-xs text-neutral-500 font-mono">End-to-End Core Loop</span>
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          The 6-Step Verifiable Value Loop
        </h1>
        <p className="text-xs text-neutral-600 max-w-2xl">
          Discover (Space) &rarr; Verify (Avis) &rarr; Prove (Quill) &rarr; Match (Scout) &rarr; Collaborate (Relay) &rarr; Build Evidence (Passport).
        </p>
      </div>

      <CoreLoopStepper />
    </div>
  );
}
