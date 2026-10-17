"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Calendar,
  Users,
  MessageSquare,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Opportunities", href: "/opportunities", icon: Briefcase },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Hackathons", href: "/hackathons", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarNavProps {
  role?: string;
  collapsed?: boolean;
}

export function SidebarNav({ role, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "ADMIN"
  );

  return (
    <nav aria-label="Main navigation">
      <ul className="space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-brand-600" : "text-neutral-400"
                  )}
                  aria-hidden="true"
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
        {role === "ADMIN" && (
          <li>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                pathname.startsWith("/admin")
                  ? "bg-amber-50 text-amber-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            >
              <ShieldCheck
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  pathname.startsWith("/admin")
                    ? "text-amber-600"
                    : "text-neutral-400"
                )}
                aria-hidden="true"
              />
              {!collapsed && <span>Admin</span>}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
