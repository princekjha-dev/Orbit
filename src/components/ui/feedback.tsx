"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

/* ─── SKELETON ───────────────────────────────────────────────────────────── */

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#E5E5EA]/70",
        className
      )}
      {...props}
    />
  );
}

/* ─── EMPTY STATE ────────────────────────────────────────────────────────── */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-[#E5E5EA] bg-white/60",
        className
      )}
    >
      {icon && (
        <div className="mb-3.5 p-3 rounded-2xl bg-[#F5F5F7] text-[#86868B] [&>svg]:h-7 [&>svg]:w-7">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-[13.5px] text-[#6E6E73] max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ─── ERROR STATE ────────────────────────────────────────────────────────── */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an unexpected error while loading this content.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl border border-[#F9CBD0] bg-[#FDEEEF]/50",
        className
      )}
    >
      <div className="p-2.5 rounded-full bg-[#FDEEEF] text-[#FF3B30] mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-[15px] font-semibold text-[#1D1D1F]">{title}</h3>
      <p className="mt-1 text-[13px] text-[#6E6E73] max-w-md">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
