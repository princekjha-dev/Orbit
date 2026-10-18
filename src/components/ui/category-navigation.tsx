"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface CategoryNavigationProps {
  categories: CategoryItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function CategoryNavigation({
  categories,
  activeId,
  onChange,
  className,
}: CategoryNavigationProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-b border-[#E5E5EA]",
        className
      )}
      role="tablist"
      aria-label="Filter categories"
    >
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = cat.id === activeId;

        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 text-[13.5px] font-medium transition-all duration-150 whitespace-nowrap rounded-t-lg -mb-[1px]",
              isActive
                ? "text-[#0071E3] font-semibold border-b-2 border-[#0071E3]"
                : "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]/80"
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-[#0071E3]" : "text-[#86868B]"
                )}
              />
            )}
            <span>{cat.label}</span>
            {cat.count !== undefined && (
              <span
                className={cn(
                  "text-[11px] px-1.5 py-0.5 rounded-full font-mono",
                  isActive
                    ? "bg-[#0071E3]/10 text-[#0071E3]"
                    : "bg-[#E5E5EA] text-[#6E6E73]"
                )}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
