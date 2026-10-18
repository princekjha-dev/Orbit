"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { validateNeutralTone } from "@/lib/relay/relay-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert, CheckCircle2, AlertCircle, ArrowLeft, MessageSquare, Info } from "lucide-react";
import Link from "next/link";

export function NewNoteClient() {
  const router = useRouter();
  const [targetEntityType, setTargetEntityType] = useState<"OPPORTUNITY" | "ORGANIZATION" | "USER_PROFILE">("ORGANIZATION");
  const [targetEntityId, setTargetEntityId] = useState("");
  const [content, setContent] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live neutral tone check
  const toneCheck = validateNeutralTone(content);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!toneCheck.valid) {
      setErrorMsg(toneCheck.reason || "Content violates neutral tone guidelines");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/orbitmod/relay/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEntityType,
          targetEntityId: targetEntityId.trim(),
          content: content.trim(),
          evidenceLinks: evidenceUrl.trim() ? [evidenceUrl.trim()] : [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit Community Note");
      }

      setSuccessMsg("Community Note successfully proposed! Now open for independent community ratings.");
      setTimeout(() => {
        router.push("/mod/relay");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/mod/relay">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5 text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Relay Hub
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Propose a Community Note
        </h1>
        <p className="text-xs text-neutral-600">
          Provide objective, evidence-based context to help fellow builders evaluate opportunities and organizations.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg text-xs flex items-center gap-2 border bg-red-50 text-red-800 border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg text-xs flex items-center gap-2 border bg-emerald-50 text-emerald-800 border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Target Entity Type</label>
            <select
              value={targetEntityType}
              onChange={(e) => setTargetEntityType(e.target.value as any)}
              className="w-full text-xs rounded-md border border-neutral-300 p-2 bg-white"
            >
              <option value="ORGANIZATION">Organization</option>
              <option value="OPPORTUNITY">Opportunity</option>
              <option value="USER_PROFILE">User Profile</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Target Identifier / Slug</label>
            <Input
              value={targetEntityId}
              onChange={(e) => setTargetEntityId(e.target.value)}
              placeholder="e.g. hypergrowth-stealth-demo"
              required
              className="text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">
            Factual Context (Objective Tone Enforced)
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="State verifiable facts only (e.g. 'Unable to confirm corporate registry under this name in Delaware or California databases. Domain was registered recently with whois privacy.')"
            rows={5}
            required
            className="text-xs"
          />
        </div>

        {!toneCheck.valid && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              Neutral Tone Violation: Flagged word &quot;{toneCheck.flaggedTerm}&quot;
            </div>
            <p className="text-[11px]">{toneCheck.reason}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Evidence Link (Optional)</label>
          <Input
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://icis.corp.delaware.gov/... or whois link"
            type="url"
            className="text-xs"
          />
        </div>

        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-neutral-800">Community Consensus Rule</div>
            <p className="text-[11px]">
              Notes are only displayed with a &quot;Rated Helpful&quot; badge once at least 3 independent community members reach consensus (helpfulness score &ge; 65%).
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={submitting || !toneCheck.valid || !content.trim() || !targetEntityId.trim()}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {submitting ? "Submitting..." : "Propose Community Note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
