import { requireAuth } from "@/lib/auth/helpers";
import { resolveOrbitRole } from "@/lib/auth/permissions";
import { TalentDashboard } from "@/components/dashboard/roles/talent-dashboard";
import { FounderDashboard } from "@/components/dashboard/roles/founder-dashboard";
import { RecruiterDashboard } from "@/components/dashboard/roles/recruiter-dashboard";
import { MentorDashboard } from "@/components/dashboard/roles/mentor-dashboard";
import { OrganizationDashboard } from "@/components/dashboard/roles/organization-dashboard";
import { OrganizerDashboard } from "@/components/dashboard/roles/organizer-dashboard";
import { PlatformAdminDashboard } from "@/components/dashboard/roles/platform-admin-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Orbit" };

export default async function DashboardPage() {
  const user = await requireAuth();
  const orbitRole = (user as any).orbitRole || resolveOrbitRole(user);

  switch (orbitRole) {
    case "FOUNDER":
      return <FounderDashboard userId={user.id!} />;
    case "RECRUITER":
      return <RecruiterDashboard userId={user.id!} />;
    case "MENTOR":
      return <MentorDashboard userId={user.id!} />;
    case "ORGANIZATION_ADMIN":
      return <OrganizationDashboard userId={user.id!} />;
    case "COMMUNITY_ORGANIZER":
      return <OrganizerDashboard userId={user.id!} />;
    case "PLATFORM_ADMIN":
      return <PlatformAdminDashboard userId={user.id!} />;
    case "TALENT":
    default:
      return <TalentDashboard userId={user.id!} name={user.name || "Talent"} />;
  }
}
