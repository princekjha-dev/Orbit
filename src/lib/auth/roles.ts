/**
 * Orbit Role Architecture
 *
 * Orbit defines 7 distinct personas across the entrepreneurship and employment ecosystem.
 * Each persona has specialized dashboards, capabilities, navigation, and workflows.
 */

export type OrbitRole =
  | "TALENT"
  | "FOUNDER"
  | "RECRUITER"
  | "MENTOR"
  | "ORGANIZATION_ADMIN"
  | "COMMUNITY_ORGANIZER"
  | "PLATFORM_ADMIN";

export interface DemoAccountConfig {
  role: OrbitRole;
  email: string;
  name: string;
  username: string;
  title: string;
  headline: string;
  description: string;
  badge: string;
}

export const DEMO_ACCOUNTS: Record<OrbitRole, DemoAccountConfig> = {
  TALENT: {
    role: "TALENT",
    email: "demo.talent@orbit.demo",
    name: "Alex Rivera",
    username: "demo_talent",
    title: "Talent / Job Seeker",
    headline: "Full-Stack Software Engineer & Open Source Contributor",
    description: "Explore Orbit as a candidate building verifiable proof of work and discovering opportunities",
    badge: "Talent",
  },
  FOUNDER: {
    role: "FOUNDER",
    email: "demo.founder@orbit.demo",
    name: "Elena Rostova",
    username: "demo_founder",
    title: "Founder",
    headline: "Founder & CEO at Aether Dynamics",
    description: "Build a venture team, define milestones, and launch opportunities",
    badge: "Founder",
  },
  RECRUITER: {
    role: "RECRUITER",
    email: "demo.recruiter@orbit.demo",
    name: "Marcus Vance",
    username: "demo_recruiter",
    title: "Recruiter",
    headline: "Head of Technical Talent at Apex Innovations",
    description: "Discover evidence-backed talent, curate talent pools, and manage candidate pipelines",
    badge: "Recruiter",
  },
  MENTOR: {
    role: "MENTOR",
    email: "demo.mentor@orbit.demo",
    name: "Dr. Sofia Chen",
    username: "demo_mentor",
    title: "Mentor",
    headline: "Distinguished Systems Architect & Startup Advisor",
    description: "Guide builders and founders through advisory sessions and project reviews",
    badge: "Mentor",
  },
  ORGANIZATION_ADMIN: {
    role: "ORGANIZATION_ADMIN",
    email: "demo.organization@orbit.demo",
    name: "David Sterling",
    username: "demo_org_admin",
    title: "Organization Admin",
    headline: "VP of Engineering & Ecosystem Lead at Apex Innovations",
    description: "Oversee company profile, team credentials, projects, and scoped hiring",
    badge: "Org Admin",
  },
  COMMUNITY_ORGANIZER: {
    role: "COMMUNITY_ORGANIZER",
    email: "demo.organizer@orbit.demo",
    name: "Maya Patel",
    username: "demo_organizer",
    title: "Community Organizer",
    headline: "Lead Organizer at Builders & Hackers Guild",
    description: "Run hackathons, host ecosystem events, and nurture developer communities",
    badge: "Organizer",
  },
  PLATFORM_ADMIN: {
    role: "PLATFORM_ADMIN",
    email: "demo.admin@orbit.demo",
    name: "Sarah Jenkins",
    username: "demo_admin",
    title: "Platform Admin",
    headline: "Orbit Trust & Safety Operations Lead",
    description: "Monitor platform operations, audit logs, organization verification, and dispute resolution",
    badge: "Admin",
  },
};

export const DEMO_ROLE_LIST: OrbitRole[] = [
  "TALENT",
  "FOUNDER",
  "RECRUITER",
  "MENTOR",
  "ORGANIZATION_ADMIN",
  "COMMUNITY_ORGANIZER",
  "PLATFORM_ADMIN",
];

export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  return Object.values(DEMO_ACCOUNTS).some(
    (acc) => acc.email.toLowerCase() === email.toLowerCase()
  );
}

export function getDemoAccountByEmail(email?: string | null): DemoAccountConfig | null {
  if (!email) return null;
  const match = Object.values(DEMO_ACCOUNTS).find(
    (acc) => acc.email.toLowerCase() === email.toLowerCase()
  );
  return match || null;
}

export function getDemoAccountByRole(role: OrbitRole): DemoAccountConfig {
  return DEMO_ACCOUNTS[role];
}
