"use client";

import { useState } from "react";
import { DnsChallengeToken } from "@/lib/avis/verification-engine";
import { Button } from "@/components/ui/button";
import { Check, Copy, Globe, RefreshCw, ShieldCheck } from "lucide-react";

interface DnsChallengeCardProps {
  organizationId: string;
  domain: string;
  initialChallenge?: DnsChallengeToken | null;
  isVerified?: boolean;
}

export function DnsChallengeCard({
  organizationId,
  domain,
  initialChallenge = null,
  isVerified = false,
}: DnsChallengeCardProps) {
  const [challenge, setChallenge] = useState<DnsChallengeToken | null>(initialChallenge);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [verifiedState, setVerifiedState] = useState(isVerified);

  const handleGenerateChallenge = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/orbitmod/avis/challenges/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, domain }),
      });
      const data = await res.json();
      if (res.ok && data.challenge) {
        setChallenge(data.challenge);
        setStatusMessage("Challenge generated. Please add the DNS TXT record below to your DNS provider.");
      } else {
        setStatusMessage(data.error || "Failed to generate challenge token");
      }
    } catch {
      setStatusMessage("Network error generating DNS challenge.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDns = async () => {
    setVerifying(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/orbitmod/avis/challenges/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY", organizationId }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setVerifiedState(true);
        setStatusMessage("✅ Domain ownership successfully verified via DNS TXT record!");
      } else {
        setStatusMessage(`⚠️ ${data.error || "DNS record could not be confirmed yet. Please allow up to 5 minutes for DNS propagation."}`);
      }
    } catch {
      setStatusMessage("Network error checking DNS record.");
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (verifiedState) {
    return (
      <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-emerald-900">Cryptographic Domain Verified</h4>
          <p className="text-xs text-emerald-700">
            Root domain <span className="font-mono font-semibold">{domain}</span> has been confirmed through automated DNS TXT challenge resolution.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Globe className="h-4 w-4 text-brand-600" />
          <h3 className="text-xs font-bold text-neutral-900">DNS Ownership Challenge (Avis Engine)</h3>
        </div>
        <span className="text-[11px] font-semibold text-neutral-500">Self-Service Domain Proof</span>
      </div>

      <p className="text-xs text-neutral-600 leading-relaxed">
        Publish a one-time cryptographic TXT record on your DNS zone to achieve verified organisation status deterministically.
      </p>

      {!challenge ? (
        <Button
          onClick={handleGenerateChallenge}
          disabled={loading}
          size="sm"
          className="w-full sm:w-auto"
        >
          {loading ? "Generating..." : "Generate DNS Challenge Token"}
        </Button>
      ) : (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 gap-2.5 bg-neutral-50 p-3.5 rounded-lg border border-neutral-200/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-sans font-bold">Record Type</span>
              <p className="text-neutral-800 font-bold">TXT</p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-sans font-bold">Host / Name</span>
              <div className="flex items-center justify-between">
                <span className="text-neutral-800 truncate">{challenge.hostRecord}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(challenge.hostRecord)}
                  className="text-neutral-500 hover:text-neutral-800 ml-2"
                  title="Copy host name"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-sans font-bold">Value / Content</span>
              <div className="flex items-center justify-between">
                <span className="text-neutral-800 truncate">{challenge.expectedTxtValue}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(challenge.expectedTxtValue)}
                  className="text-neutral-500 hover:text-neutral-800 ml-2"
                  title="Copy token"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={handleVerifyDns}
              disabled={verifying}
              size="sm"
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {verifying ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Resolving DNS...
                </>
              ) : (
                "Verify DNS TXT Record"
              )}
            </Button>
            <Button
              onClick={handleGenerateChallenge}
              disabled={loading || verifying}
              variant="outline"
              size="sm"
            >
              Rotate Token
            </Button>
          </div>
        </div>
      )}

      {statusMessage && (
        <p className="text-xs font-medium p-2.5 rounded-md bg-neutral-50 border border-neutral-200 text-neutral-800">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
