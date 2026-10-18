"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Scale, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AvisAppealsPage() {
  const [recordId, setRecordId] = useState("");
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordId.trim() || reason.trim().length < 15) {
      setErrorMsg("Please provide a valid Record ID and at least 15 characters of appeal context.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orbitmod/avis/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId,
          reason,
          evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Failed to submit appeal");
      }
    } catch {
      setErrorMsg("Network error submitting appeal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link
        href="/mod/avis"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Avis Console</span>
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
              Submit Verification Appeal
            </h1>
            <p className="text-xs text-neutral-500">
              Appeals are assigned to an independent reviewer not involved in the original determination.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900">Appeal Successfully Filed</h3>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Your appeal has been queued for secondary review under the 48-hour SLA. State has transitioned to &ldquo;Needs Review&rdquo;.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setRecordId("");
                setReason("");
                setEvidenceUrl("");
              }}
              variant="outline"
              size="sm"
            >
              Submit Another Appeal
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Target Record ID or Organization Slug
              </label>
              <Input
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                placeholder="e.g. apex-innovations-demo or rec_org_..."
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Grounds for Appeal & Detailed Context
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the current determination should be reconsidered, referencing domain proof or documentation..."
                rows={5}
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Additional Supporting Evidence URL (Optional)
              </label>
              <Input
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://registry.example.org/cert-verify"
                className="text-xs"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Filing Appeal..." : "Submit Appeal for Independent Review"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
