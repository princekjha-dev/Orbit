import { AvisState } from "@/lib/avis/verification-engine";
import { ShieldCheck, AlertTriangle, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  state: AvisState;
  showDetails?: boolean;
  reasons?: Array<{ code: string; message: string; severity?: string }>;
  className?: string;
}

export function AvisTrustBadge({
  state,
  showDetails = false,
  reasons = [],
  className,
}: TrustBadgeProps) {
  const configs: Record<
    AvisState,
    { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string; desc: string }
  > = {
    VERIFIED: {
      label: "Verified Entity",
      icon: CheckCircle2,
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
      desc: "Confirmed domain ownership via cryptographic DNS TXT challenge or manual review.",
    },
    NEEDS_REVIEW: {
      label: "Needs Review",
      icon: AlertCircle,
      badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
      desc: "Requires human review or additional evidence before trust verification.",
    },
    LIMITED_EVIDENCE: {
      label: "Limited Evidence",
      icon: HelpCircle,
      badgeClass: "bg-blue-50 text-blue-800 border-blue-300",
      desc: "Initial documents submitted but full verification challenge is incomplete.",
    },
    SUSPICIOUS: {
      label: "Risk Indicator",
      icon: AlertTriangle,
      badgeClass: "bg-red-50 text-red-800 border-red-300",
      desc: "Risk indicators identified (look-alike domain, fee request pattern, or unreachable links).",
    },
    UNVERIFIED: {
      label: "Unverified",
      icon: HelpCircle,
      badgeClass: "bg-neutral-100 text-neutral-700 border-neutral-300",
      desc: "No verification evidence has been submitted or verified yet.",
    },
  };

  const cfg = configs[state] || configs.UNVERIFIED;
  const Icon = cfg.icon;

  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs",
          cfg.badgeClass
        )}
      >
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{cfg.label}</span>
      </span>

      {showDetails && (
        <div className="text-[11px] text-neutral-600 space-y-1 mt-0.5">
          <p className="font-medium text-neutral-700">{cfg.desc}</p>
          {reasons.length > 0 && (
            <ul className="space-y-0.5 pt-1 border-t border-neutral-200/60">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1 text-[11px] text-neutral-600">
                  <span className="text-neutral-400 mt-0.5">•</span>
                  <span>{r.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
