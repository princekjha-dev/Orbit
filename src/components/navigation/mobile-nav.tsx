"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
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
  LogOut,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { logout } from "@/lib/auth/logout";
import { cn } from "@/lib/utils";
import { ORBIT_AVATAR } from "@/lib/avatars";

interface MobileNavProps {
  role?: string;
  user?: any;
}

export function MobileNav({ role, user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const mainNavItems = [
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

  const personalNavItems = [
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
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-drawer"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-drawer"
            className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white shadow-modal flex flex-col animate-slide-up border-l border-[#E5E5EA]"
            role="dialog"
            aria-label="Orbit Navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F2]">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ORBIT_AVATAR}
                    alt="Orbit"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-[#1D1D1F]">
                  Orbit Navigation
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {/* Main */}
              <div>
                <p className="px-2 pb-1.5 text-[11px] font-medium tracking-wider uppercase text-[#86868B]">
                  Main
                </p>
                <ul className="space-y-0.5">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            active
                              ? "bg-[#0071E3]/[0.08] text-[#0071E3] font-semibold"
                              : "text-[#48484A] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              active ? "text-[#0071E3]" : "text-[#6E6E73]"
                            )}
                          />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Personal */}
              <div>
                <p className="px-2 pb-1.5 text-[11px] font-medium tracking-wider uppercase text-[#86868B]">
                  Personal
                </p>
                <ul className="space-y-0.5">
                  {personalNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            active
                              ? "bg-[#0071E3]/[0.08] text-[#0071E3] font-semibold"
                              : "text-[#48484A] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              active ? "text-[#0071E3]" : "text-[#6E6E73]"
                            )}
                          />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Account card & Sign out */}
            {user && (
              <div className="p-4 border-t border-[#F0F0F2] bg-[#F5F5F7]/50">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
                >
                  <Avatar src={user.image} name={user.name || "User"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1D1D1F] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#86868B] truncate">{user.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => logout("/login")}
                  className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-medium text-[#FF3B30] hover:bg-white py-2 rounded-lg transition-colors border border-transparent hover:border-[#E5E5EA]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
