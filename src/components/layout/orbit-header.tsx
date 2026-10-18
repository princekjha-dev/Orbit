"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Search,
  Bell,
  Command,
  X,
  Sparkles,
} from "lucide-react";

interface OrbitHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function OrbitHeader({
  title,
  showBack = false,
  backHref,
  actions,
  children,
  className,
}: OrbitHeaderProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#E5E5EA] bg-[#FFFFFF]/90 backdrop-blur-md px-4 sm:px-6 transition-all",
        className
      )}
    >
      {/* Left side: Back button & Contextual Title / Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[13px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] p-1.5 -ml-2 rounded-md hover:bg-[#F5F5F7] transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        {title && (
          <h2 className="text-[15px] font-semibold tracking-tight text-[#1D1D1F] truncate">
            {title}
          </h2>
        )}

        {children}
      </div>

      {/* Right side: Search trigger, notifications, contextual actions */}
      <div className="flex items-center gap-2">
        {/* Quick Search Trigger */}
        <Link
          href="/search"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:border-[#D1D1D6] transition-all text-[12.5px]"
          title="Search Orbit (⌘K)"
        >
          <Search className="h-3.5 w-3.5 text-[#6E6E73]" />
          <span className="hidden sm:inline pr-2">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded px-1 text-[10px] bg-white border border-[#E5E5EA] text-[#86868B]">
            ⌘K
          </kbd>
        </Link>

        {/* Notifications Icon Button */}
        <Link
          href="/action-center"
          className="relative p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors"
          title="Notifications & Action Center"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#0071E3]" />
        </Link>

        {/* Custom Contextual Actions passed by page */}
        {actions && <div className="flex items-center gap-2 pl-1">{actions}</div>}
      </div>
    </header>
  );
}
