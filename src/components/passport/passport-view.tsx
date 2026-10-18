"use client";

import React, { useState } from "react";
import { CandidatePassport } from "@/lib/passport/passport-service";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Award, FileCode, CheckCircle2, Download, Briefcase, Share2 } from "lucide-react";

interface PassportViewProps {
  passport: CandidatePassport;
}

export function PassportView({ passport }: PassportViewProps) {
  const [exporting, setExporting] = useState(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/orbitmod/passport/export", { method: "POST" });
      const data = await res.json();
      setExportedJson(JSON.stringify(data, null, 2));
    } catch {
      // Ignore
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              AVIS TRUST SCORE: {passport.avisVerification.trustScore}%
            </span>
            <span className="text-xs text-neutral-400 font-mono">@{passport.username}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{passport.displayName}</h1>
          <p className="text-sm text-neutral-300 max-w-xl">{passport.headline}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 flex items-center gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Generating..." : "Export W3C JSON-LD"}
          </Button>
        </div>
      </div>

      {/* Cryptographic Digest Pill */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Cryptographic Passport Digest (SHA-256)
          </div>
          <p className="text-[11px] text-blue-800 font-mono select-all truncate max-w-xl">
            {passport.portableDigest}
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 shrink-0">
          IMMUTABLE PROOF
        </span>
      </div>

      {/* Export Viewer Modal */}
      {exportedJson && (
        <div className="rounded-xl border border-neutral-300 bg-neutral-900 text-neutral-100 p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-emerald-400 font-bold">W3C Verifiable Credential Export</span>
            <Button size="sm" variant="ghost" onClick={() => setExportedJson(null)} className="h-6 text-xs text-neutral-400">
              Close
            </Button>
          </div>
          <pre className="text-[11px] font-mono overflow-x-auto max-h-60 text-neutral-300 select-all p-2 bg-neutral-950 rounded-sm">
            {exportedJson}
          </pre>
        </div>
      )}

      {/* Grid: Skills + Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Skills */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Award className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-neutral-900">Verified ESCO Skills</h2>
          </div>

          <div className="space-y-3">
            {passport.verifiedSkills.map((s) => (
              <div
                key={s.skillId}
                className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-200"
              >
                <div>
                  <span className="text-xs font-bold text-neutral-900">{s.skillName}</span>
                  <div className="text-[10px] text-neutral-500">{s.evidenceCount} verified artifacts attached</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {s.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Team Pod Projects */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-neutral-900">Completed Projects & Pod Attestations</h2>
          </div>

          <div className="space-y-3">
            {passport.completedProjects.length === 0 ? (
              <div className="text-xs text-neutral-500 text-center py-6">
                No completed team projects recorded yet.
              </div>
            ) : (
              passport.completedProjects.map((p) => (
                <div
                  key={p.projectId}
                  className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-neutral-900">{p.projectTitle}</div>
                      <div className="text-[11px] text-neutral-600 font-medium">Role: {p.roleName}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {p.peerAttestationsCount} PEER ATTESTATIONS
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-neutral-500 truncate select-all">
                    Digest: {p.evidenceSha256}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cryptographic Artifacts */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <FileCode className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-neutral-900">Cryptographically Auditable Evidence Artifacts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passport.evidenceArtifacts.map((art) => (
            <div
              key={art.id}
              className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-neutral-900">{art.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {art.assessmentScore ? `${art.assessmentScore}% SCORE` : "VERIFIED"}
                </span>
              </div>

              <div className="bg-neutral-900 text-neutral-200 font-mono text-[11px] p-2 rounded-sm overflow-x-auto max-h-24">
                <pre>{art.content}</pre>
              </div>

              <div className="text-[10px] font-mono text-neutral-500 truncate select-all">
                SHA-256: {art.artifactSha256}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
