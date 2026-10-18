"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { OrbitRole } from "@/lib/auth/roles";
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
  Users2,
  Search,
  Compass,
  TrendingUp,
  CheckSquare,
  Network,
  Award,
  Building2,
  FileCheck,
  AlertTriangle,
  Scale,
  Activity,
  Rocket,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_NAV_ITEMS: Record<OrbitRole, NavItem[]> = {
  TALENT: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "OrbitMod (4 Dots)", href: "/mod", icon: Sparkles },
    { label: "Action Center", href: "/action-center", icon: CheckSquare },
    { label: "Opportunities", href: "/opportunities", icon: Briefcase },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Evidence Timeline", href: "/evidence/timeline", icon: Award },
    { label: "Career Insights", href: "/career/insights", icon: Compass },
    { label: "Communities", href: "/communities", icon: Users2 },
    { label: "Events & Hackathons", href: "/events", icon: Calendar },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  FOUNDER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "OrbitMod (4 Dots)", href: "/mod", icon: Sparkles },
    { label: "Startup Workspace", href: "/startups", icon: Rocket },
    { label: "Opportunities", href: "/opportunities", icon: Briefcase },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Collaborations", href: "/collaborations", icon: Users2 },
    { label: "Talent Discovery", href: "/ecosystem", icon: Network },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  RECRUITER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "OrbitMod (4 Dots)", href: "/mod", icon: Sparkles },
    { label: "Recruiter Workspace", href: "/recruiter/workspace", icon: Search },
    { label: "Candidate Search", href: "/recruiter", icon: Network },
    { label: "Opportunities", href: "/opportunities", icon: Briefcase },
    { label: "Projects & Proofs", href: "/projects", icon: FolderKanban },
    { label: "Talent Analytics", href: "/analytics", icon: TrendingUp },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  MENTOR: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "OrbitMod (4 Dots)", href: "/mod", icon: Sparkles },
    { label: "Advisory & Reviews", href: "/action-center", icon: CheckSquare },
    { label: "Communities", href: "/communities", icon: Users2 },
    { label: "Projects & Proofs", href: "/projects", icon: FolderKanban },
    { label: "Ecosystem Network", href: "/ecosystem", icon: Network },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  ORGANIZATION_ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "OrbitMod (4 Dots)", href: "/mod", icon: Sparkles },
    { label: "Organization Hub", href: "/org/apex-innovations", icon: Building2 },
    { label: "Opportunities", href: "/opportunities", icon: Briefcase },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Recruiter Pipeline", href: "/recruiter/workspace", icon: Search },
    { label: "Organization Analytics", href: "/analytics", icon: TrendingUp },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  COMMUNITY_ORGANIZER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "OrbitMod (4 Dots)", href: "/mod", icon: Sparkles },
    { label: "Communities", href: "/communities", icon: Users2 },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Hackathons", href: "/hackathons", icon: Users },
    { label: "Collaborations", href: "/collaborations", icon: Network },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  PLATFORM_ADMIN: [
    { label: "Platform Overview", href: "/admin", icon: Activity },
    { label: "OrbitMod (4 Dots)", href: "/mod", icon: Sparkles },
    { label: "Users & Accounts", href: "/admin/users", icon: Users },
    { label: "Verification Queue", href: "/admin/verifications", icon: FileCheck },
    { label: "Moderation & Reports", href: "/admin/reports", icon: AlertTriangle },
    { label: "Disputes", href: "/admin/disputes", icon: Scale },
    { label: "Audit Logs", href: "/admin/audit", icon: ShieldCheck },
    { label: "User Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

interface SidebarNavProps {
  role?: string;
  collapsed?: boolean;
}

export function SidebarNav({ role, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  // Map input role string to OrbitRole
  let orbitRole: OrbitRole = "TALENT";
  if (role) {
    if (role === "ADMIN" || role === "PLATFORM_ADMIN") {
      orbitRole = "PLATFORM_ADMIN";
    } else if (role === "FOUNDER") {
      orbitRole = "FOUNDER";
    } else if (role === "RECRUITER") {
      orbitRole = "RECRUITER";
    } else if (role === "MENTOR") {
      orbitRole = "MENTOR";
    } else if (role === "ORGANIZATION_ADMIN") {
      orbitRole = "ORGANIZATION_ADMIN";
    } else if (role === "COMMUNITY_ORGANIZER") {
      orbitRole = "COMMUNITY_ORGANIZER";
    }
  }

  const items = ROLE_NAV_ITEMS[orbitRole] || ROLE_NAV_ITEMS.TALENT;

  return (
    <nav aria-label="Main navigation">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
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
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
