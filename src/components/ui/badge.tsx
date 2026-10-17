import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "blue" | "green" | "amber" | "red" | "neutral" | "purple";
}

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  const variants = {
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    green: "bg-green-50 text-green-700 border border-green-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    red: "bg-red-50 text-red-700 border border-red-100",
    neutral: "bg-neutral-100 text-neutral-700 border border-neutral-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Status-specific badge helpers
export function VerificationBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    VERIFIED: { label: "Verified", variant: "green" },
    PENDING: { label: "Pending Review", variant: "amber" },
    UNVERIFIED: { label: "Unverified", variant: "neutral" },
    SUSPENDED: { label: "Suspended", variant: "red" },
  };
  const { label, variant } = config[status] ?? { label: status, variant: "neutral" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function ApplicationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    SAVED: { label: "Saved", variant: "neutral" },
    APPLIED: { label: "Applied", variant: "blue" },
    UNDER_REVIEW: { label: "Under Review", variant: "amber" },
    SHORTLISTED: { label: "Shortlisted", variant: "purple" },
    INTERVIEW: { label: "Interview", variant: "blue" },
    SELECTED: { label: "Selected", variant: "green" },
    REJECTED: { label: "Rejected", variant: "red" },
    WITHDRAWN: { label: "Withdrawn", variant: "neutral" },
  };
  const { label, variant } = config[status] ?? { label: status, variant: "neutral" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function OpportunityTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    JOB: { label: "Job", variant: "blue" },
    INTERNSHIP: { label: "Internship", variant: "green" },
    PAID_PROJECT: { label: "Paid Project", variant: "amber" },
    STARTUP_ROLE: { label: "Startup Role", variant: "purple" },
  };
  const { label, variant } = config[type] ?? { label: type, variant: "neutral" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function WorkModeBadge({ mode }: { mode: string }) {
  const labels: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "On-site",
  };
  return <Badge variant="neutral">{labels[mode] ?? mode}</Badge>;
}
