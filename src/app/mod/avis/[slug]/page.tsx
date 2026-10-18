import { notFound } from "next/navigation";
import Link from "next/link";
import { getVerificationRecord } from "@/lib/avis/avis-service";
import { AvisTrustBadge } from "@/components/avis/trust-badge";
import { DnsChallengeCard } from "@/components/avis/dns-challenge-card";
import {
  ShieldCheck,
  Building2,
  Globe,
  FileText,
  Calendar,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default async function OrganizationVerificationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getVerificationRecord("ORGANIZATION", slug);

  if (!record) {
    notFound();
  }

  const isApex = slug.includes("apex");
  const domain = isApex ? "apexinnovations.org" : "hypergrowth-labs-stealth.xyz";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/mod/avis"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Avis Console</span>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-xs">
              {record.resourceName ? record.resourceName.charAt(0) : "O"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                  {record.resourceName || slug}
                </h1>
                <AvisTrustBadge state={record.state} />
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                slug: {slug} • ID: {record.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/mod/avis/appeals?recordId=${record.id}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Submit Appeal
            </Link>
          </div>
        </div>

        {/* Factual reasons strip */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
          <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Verification Evidence & Reason Trail
          </h3>
          <ul className="space-y-1 text-xs text-neutral-600">
            {record.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>
                  <strong className="text-neutral-800">{r.code}:</strong> {r.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grid: DNS Challenge & Evidence Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DNS Challenge Panel */}
        <div className="space-y-6">
          <DnsChallengeCard
            organizationId={slug}
            domain={domain}
            initialChallenge={record.domainChallenge}
            isVerified={record.state === "VERIFIED"}
          />

          {/* Recruiter Domain Affiliation */}
          <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900">Recruiter Domain Policy</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                Rule Enforced
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Recruiters claiming affiliation with this organization must possess an active, verified email ending in:
            </p>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 font-mono text-xs font-semibold text-neutral-800">
              @{domain}
            </div>
            <p className="text-[11px] text-neutral-400">
              Personal webmail addresses (gmail.com, outlook.com) are rejected automatically for verified employer postings.
            </p>
          </div>
        </div>

        {/* Verified Evidence Rows */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900">Audited Evidence Rows</h3>
              <span className="text-[11px] text-neutral-400">{record.evidence.length} Record(s)</span>
            </div>

            {record.evidence.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 bg-neutral-50 rounded-lg">
                No formal evidence artifacts filed yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {record.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-800">{ev.type}</span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-mono truncate">{ev.source}</p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-200/50">
                      <span>Checked: {new Date(ev.checkedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Private Storage
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
