import React from "react";
import { cn } from "@/lib/utils";

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  centered?: boolean;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  centered = false,
}: PageIntroProps) {
  return (
    <div
      className={cn(
        "pt-6 pb-6 sm:pt-8 sm:pb-8 transition-all",
        centered && "text-center max-w-3xl mx-auto",
        className
      )}
    >
      {eyebrow && (
        <p className="text-[11.5px] font-semibold tracking-wider uppercase text-[#0071E3] mb-2">
          {eyebrow}
        </p>
      )}

      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-baseline justify-between gap-4",
          centered && "sm:flex-col sm:items-center"
        )}
      >
        <div className="max-w-3xl space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold tracking-tight text-[#1D1D1F] leading-[1.15]">
            {title}
          </h1>
          {description && (
            <p className="text-[15px] sm:text-[16px] text-[#6E6E73] font-normal leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 pt-1 sm:pt-0 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
