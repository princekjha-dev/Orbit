import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getAvisMetrics } from "@/lib/avis/avis-service";
import { AvisTrustBadge } from "@/components/avis/trust-badge";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Scale,
  Search,
} from "lucide-react";

export const metadata = {
  title: "Avis Console | Trust & Verification",
  description: "Factual, evidence-based trust and verification engine for Orbit organizations and opportunities.",
};

export default async function AvisConsolePage() {
  const user = await getCurrentUser();
  const metrics = await getAvisMetrics();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                AVIS — Trust & Verification Console
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                &ldquo;Can I trust this person, organisation or opportunity?&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mod/avis/queue"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-xs transition-colors"
          >
            <FileCheck className="h-4 w-4" />
            <span>Human Review Queue</span>
          </Link>
          <Link
            href="/mod/avis/appeals"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 shadow-xs transition-colors"
          >
            <Scale className="h-4 w-4" />
            <span>Appeals</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Deterministic, zero fake metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Verified Entities</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900">{metrics.verifiedCount}</div>
          <p className="text-[11px] text-neutral-400">Validated via DNS TXT or reviewer audit</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Pending Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{metrics.needsReviewCount}</div>
          <p className="text-[11px] text-neutral-400">Within 48-hour SLA window</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Risk Indicators</span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-700">{metrics.suspiciousCount}</div>
          <p className="text-[11px] text-neutral-400">Under investigation or flagged</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Median Review SLA</span>
            <Clock className="h-4 w-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900">{metrics.medianReviewTimeHours}h</div>
          <p className="text-[11px] text-neutral-400">From submission to decision</p>
        </div>
      </div>

      {/* Core Avis Verification Rules */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900">Avis Architectural Trust Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-600">
          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              1. Deterministic Upgrade Only
            </span>
            <p className="text-neutral-500 leading-relaxed">
              VERIFIED status is mathematically restricted to successful DNS TXT domain challenges or signed human reviewer decisions. AI never upgrades trust.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              2. Fail Safe to Review
            </span>
            <p className="text-neutral-500 leading-relaxed">
              If any external URL check or database provider times out, the entity drops to NEEDS_REVIEW with reason &ldquo;check unavailable&rdquo;, never VERIFIED.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              3. Independent Appeals
            </span>
            <p className="text-neutral-500 leading-relaxed">
              Any subject may appeal an adverse decision. Appeals are assigned to an independent reviewer who was not involved in the original determination.
            </p>
          </div>
        </div>
      </div>

      {/* Explore Verification Profiles */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Featured Organization Trust Profiles</h2>
            <p className="text-xs text-neutral-500">Live inspection of evidence trails, DNS status, and recruiter domain matching</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/mod/avis/apex-innovations-demo"
            className="p-4 rounded-lg border border-neutral-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-neutral-900">Apex Innovations (DEMO)</span>
                <AvisTrustBadge state="VERIFIED" />
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">domain: apexinnovations.org • DNS TXT confirmed</p>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>

          <Link
            href="/mod/avis/hypergrowth-stealth-demo"
            className="p-4 rounded-lg border border-neutral-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-neutral-900">HyperGrowth Labs (DEMO)</span>
                <AvisTrustBadge state="NEEDS_REVIEW" />
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">domain: hypergrowth-labs-stealth.xyz • Pending review</p>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
