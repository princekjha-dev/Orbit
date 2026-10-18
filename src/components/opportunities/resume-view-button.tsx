"use client";

import React, { useState } from "react";
import { FileText, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeViewButtonProps {
  applicationId: string;
  hasResume: boolean;
}

export function ResumeViewButton({ applicationId, hasResume }: ResumeViewButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasResume) {
    return (
      <span className="text-xs text-[#86868B] italic">No resume attached</span>
    );
  }

  const handleOpenResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/resume-url`);
      const data = await res.json();
      if (!res.ok || !data.success || !data.signedUrl) {
        setError(data.error?.message || "Failed to load resume");
        return;
      }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleOpenResume}
        className="text-xs h-7 gap-1 border-[#0071E3]/30 text-[#0071E3] hover:bg-[#0071E3]/10"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <FileText className="h-3 w-3" />
        )}
        <span>View Resume</span>
        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
      </Button>
      {error && <span className="text-[11px] text-[#FF3B30]">{error}</span>}
    </div>
  );
}
