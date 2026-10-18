"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Sparkles, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function NewEvidenceClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/orbitmod/quill/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          linkedSkillIds: ["skill_ts", "skill_arch"],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to issue evidence artifact");
      }

      const artifact = await res.json();
      setSuccessMsg(`Evidence artifact issued! SHA-256 Fingerprint: ${artifact.artifactSha256}`);
      setTimeout(() => {
        router.push("/mod/quill");
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
        <Link href="/mod/quill">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5 text-neutral-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Quill Hub
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Issue Verifiable Evidence Artifact
        </h1>
        <p className="text-xs text-neutral-600">
          Create tamper-proof proof-of-work with cryptographic SHA-256 integrity fingerprinting.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg text-xs flex items-center gap-2 border bg-red-50 text-red-800 border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg text-xs flex items-center gap-2 border bg-emerald-50 text-emerald-800 border-emerald-200 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Artifact Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Distributed HMAC Security Verifier Implementation"
            required
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">
            Artifact Payload / Solution Code / Architecture Spec
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste code or detailed system architecture text..."
            rows={8}
            required
            className="text-xs font-mono"
          />
        </div>

        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-neutral-800">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> Tamper-Proof Cryptographic Invariant
          </div>
          <p className="text-[11px]">
            Payload will be hashed using SHA-256 upon submission. Any post-submission alteration will cause a hash mismatch audit flag.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" disabled={submitting || !title || !content} className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {submitting ? "Hashing & Recording..." : "Create Cryptographic Artifact"}
          </Button>
        </div>
      </form>
    </div>
  );
}
