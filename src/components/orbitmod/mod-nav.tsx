"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ORBIT_AVATAR, getDotAvatar } from "@/lib/avatars";
import {
  ShieldCheck,
  Compass,
  FileCheck2,
  MessageCircle,
  Globe,
  Award,
  Sparkles,
} from "lucide-react";

export function OrbitModSubNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/mod", icon: Sparkles, exact: true },
    { label: "Avis (Trust)", href: "/mod/avis", icon: ShieldCheck, dot: "avis" },
    { label: "Scout (Matches & Teams)", href: "/mod/scout", icon: Compass, dot: "scout" },
    { label: "Quill (Proof of Work)", href: "/mod/quill", icon: FileCheck2, dot: "quill" },
    { label: "Relay (Spaces & Safety)", href: "/mod/relay", icon: MessageCircle, dot: "relay" },
    { label: "Spaces", href: "/mod/spaces", icon: Globe },
    { label: "Evidence Passport", href: "/mod/passport", icon: Award },
  ];

  return (
    <div className="border-b border-neutral-200 bg-white sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md overflow-hidden flex items-center justify-center shadow-xs flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ORBIT_AVATAR} alt="Orbit" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-bold text-neutral-900 tracking-tight">OrbitMod V5</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Four Dots Core
              </span>
            </div>
          </div>

          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="OrbitMod Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700 border border-brand-200/60"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.dot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getDotAvatar(item.dot)}
                      alt={item.label}
                      className="h-3.5 w-3.5 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <Icon className={cn("h-3.5 w-3.5", isActive ? "text-brand-600" : "text-neutral-400")} />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
