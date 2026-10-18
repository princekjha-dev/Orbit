import React from "react";
import { VerifiableEvidenceArtifact } from "@/lib/quill/quill-engine";
import { ShieldCheck, FileCode, CheckCircle2, Copy } from "lucide-react";

interface EvidenceArtifactCardProps {
  artifact: VerifiableEvidenceArtifact;
  isValidIntegrity?: boolean;
}

export function EvidenceArtifactCard({
  artifact,
  isValidIntegrity = true,
}: EvidenceArtifactCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3 hover:border-neutral-300 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-neutral-900">{artifact.title}</h3>
        </div>

        <div className="flex items-center gap-2">
          {artifact.status === "VERIFIED" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              VERIFIED ({artifact.assessmentScore}%)
            </span>
          )}
          {isValidIntegrity ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              TAMPER_PROOF
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
              HASH_MISMATCH
            </span>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto max-h-36">
        <pre>{artifact.content}</pre>
      </div>

      {/* SHA-256 Fingerprint */}
      <div className="p-2.5 rounded-md bg-neutral-50 border border-neutral-200 text-xs space-y-1">
        <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
          <span>SHA-256 FINGERPRINT</span>
          <span>IMMUTABLE</span>
        </div>
        <div className="font-mono text-[11px] text-neutral-800 truncate select-all">
          {artifact.artifactSha256}
        </div>
      </div>

      <div className="flex justify-between items-center text-[11px] text-neutral-500 pt-1">
        <div>Issued: {new Date(artifact.createdAt).toLocaleDateString()}</div>
        <div className="font-mono">ID: {artifact.id}</div>
      </div>
    </div>
  );
}
