"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentRailProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export function ContentRail({
  title,
  subtitle,
  action,
  children,
  className,
}: ContentRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -340 : 340;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className={cn("space-y-3.5 my-8", className)}>
      {/* Header with Title and Scroll Controls */}
      {(title || action) && (
        <div className="flex items-end justify-between px-1">
          <div>
            {title && (
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[13.5px] text-[#6E6E73] mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {action}
            <div className="hidden sm:flex items-center gap-1 pl-2">
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="p-1.5 rounded-full border border-[#E5E5EA] bg-white text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="p-1.5 rounded-full border border-[#E5E5EA] bg-white text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors shadow-2xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrolling Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1 px-1 snap-x snap-mandatory"
      >
        {children}
      </div>
    </section>
  );
}
