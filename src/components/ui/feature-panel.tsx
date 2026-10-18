import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface FeaturePanelProps {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  visualContent?: React.ReactNode;
  theme?: "blue" | "neutral" | "dark";
  className?: string;
}

export function FeaturePanel({
  eyebrow,
  title,
  description,
  badge,
  primaryAction,
  secondaryAction,
  visualContent,
  theme = "neutral",
  className,
}: FeaturePanelProps) {
  const getThemeStyles = () => {
    switch (theme) {
      case "blue":
        return "bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F3FF] border-[#B9DCFF]/60 text-[#1D1D1F]";
      case "dark":
        return "bg-[#1C1C1E] border-[#2C2C2E] text-white";
      case "neutral":
      default:
        return "bg-[#FFFFFF] border-[#E5E5EA] text-[#1D1D1F]";
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden transition-all",
        getThemeStyles(),
        className
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Headline & Copy */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            {eyebrow && (
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#0071E3]">
                {eyebrow}
              </span>
            )}
            {badge && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
                {badge}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-tight leading-[1.2]">
            {title}
          </h2>

          <p className="text-[15px] sm:text-[16px] text-[#6E6E73] font-normal leading-relaxed max-w-xl">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {primaryAction && (
              <Link
                href={primaryAction.href}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] text-white text-[13.5px] font-medium hover:bg-[#0077ED] transition-all shadow-xs"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {secondaryAction && (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-[#E5E5EA] bg-white text-[#1D1D1F] text-[13.5px] font-medium hover:bg-[#F5F5F7] transition-all"
              >
                {secondaryAction.label}
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Visual / Metadata Graphic */}
        {visualContent && (
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            {visualContent}
          </div>
        )}
      </div>
    </div>
  );
}
