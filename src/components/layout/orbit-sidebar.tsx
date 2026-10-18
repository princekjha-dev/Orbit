"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DemoIndicator } from "@/components/navigation/demo-indicator";
import { ORBIT_AVATAR } from "@/lib/avatars";
import {
  Home,
  Compass,
  Briefcase,
  MessageSquare,
  FolderKanban,
  Calendar,
  Trophy,
  Users2,
  Sparkles,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  ExternalLink,
} from "lucide-react";

interface OrbitSidebarProps {
  user: any;
  activeRole?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export function OrbitSidebar({ user, activeRole }: OrbitSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainNavItems: NavItem[] = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Opportunities", href: "/opportunities", icon: Briefcase },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Hackathons", href: "/hackathons", icon: Trophy },
    { label: "Communities", href: "/communities", icon: Users2 },
    { label: "Dots", href: "/dots", icon: Sparkles },
  ];

  const personalNavItems: NavItem[] = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const isItemActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/home" || pathname === "/dashboard";
    }
    if (href === "/dots") {
      return pathname.startsWith("/dots") || pathname.startsWith("/mod");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col border-r border-[#E5E5EA] bg-[#FFFFFF] z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
        collapsed ? "lg:w-[76px]" : "lg:w-[260px]"
      )}
      aria-label="Application navigation"
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-[#F0F0F2]">
        <Link
          href="/home"
          className={cn(
            "flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded-lg",
            collapsed && "justify-center w-full"
          )}
        >
          <div className="h-7 w-7 rounded-[7px] overflow-hidden flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ORBIT_AVATAR}
              alt="Orbit"
              className="h-full w-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
                Orbit
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
                Pro
              </span>
            </div>
          )}
        </Link>

        {/* Sidebar Collapse Toggle */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Demo Persona Indicator when present */}
      {user && !collapsed && (
        <div className="px-3 pt-3">
          <DemoIndicator email={user.email} orbitRole={activeRole || user.orbitRole} />
        </div>
      )}

      {/* Main Nav Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {/* Main Section */}
        <div>
          {!collapsed ? (
            <p className="px-3 pb-1 text-[11px] font-medium tracking-wider uppercase text-[#86868B]">
              Main
            </p>
          ) : (
            <div className="w-4 h-0.5 bg-[#E5E5EA] mx-auto mb-2 rounded-full" />
          )}
          <ul className="space-y-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 relative group",
                      active
                        ? "bg-[#0071E3]/[0.08] text-[#0071E3] font-semibold"
                        : "text-[#48484A] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]",
                      collapsed && "justify-center px-0 py-2.5"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0071E3] rounded-r-full" />
                    )}
                    <Icon
                      className={cn(
                        "h-[17px] w-[17px] flex-shrink-0 transition-transform duration-150 group-hover:scale-105",
                        active ? "text-[#0071E3]" : "text-[#6E6E73]"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Personal Section */}
        <div>
          {!collapsed ? (
            <p className="px-3 pb-1 text-[11px] font-medium tracking-wider uppercase text-[#86868B]">
              Personal
            </p>
          ) : (
            <div className="w-4 h-0.5 bg-[#E5E5EA] mx-auto mb-2 rounded-full" />
          )}
          <ul className="space-y-0.5">
            {personalNavItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 relative group",
                      active
                        ? "bg-[#0071E3]/[0.08] text-[#0071E3] font-semibold"
                        : "text-[#48484A] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]",
                      collapsed && "justify-center px-0 py-2.5"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0071E3] rounded-r-full" />
                    )}
                    <Icon
                      className={cn(
                        "h-[17px] w-[17px] flex-shrink-0 transition-transform duration-150 group-hover:scale-105",
                        active ? "text-[#0071E3]" : "text-[#6E6E73]"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Expand Button if collapsed */}
      {collapsed && (
        <div className="px-3 py-2 border-t border-[#F0F0F2] flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-md transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bottom User Account Area */}
      {user && (
        <div className="p-3 border-t border-[#F0F0F2] bg-[#FFFFFF]">
          {!collapsed ? (
            <div className="space-y-1.5">
              <Link
                href="/profile"
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F5F7] transition-colors group"
              >
                <Avatar
                  src={user.image}
                  name={user.name || "User"}
                  size="sm"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-medium text-[#1D1D1F] truncate group-hover:text-[#0071E3] transition-colors">
                    {user.name || "Member"}
                  </p>
                  <p className="text-[11px] text-[#86868B] truncate">
                    {user.email}
                  </p>
                </div>
              </Link>
              <div className="pt-1 flex items-center justify-between px-2">
                <SignOutButton />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link href="/profile" title={user.name || "Profile"}>
                <Avatar
                  src={user.image}
                  name={user.name || "User"}
                  size="sm"
                />
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
