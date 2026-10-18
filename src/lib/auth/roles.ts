/**
 * Orbit Role Architecture
 *
 * Orbit defines 7 distinct personas across the entrepreneurship and employment ecosystem.
 * Each persona has specialized dashboards, capabilities, navigation, and workflows.
 *
 * All demo identities below are synthetic Indian personas created exclusively for demonstration.
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
  location: string;
  organization?: string;
  startup?: string;
}

export const DEMO_PASSWORD_DEFAULT = "OrbitDemo@2026!";

export const DEMO_ACCOUNTS: Record<OrbitRole, DemoAccountConfig> = {
  TALENT: {
    role: "TALENT",
    email: "demo.talent@orbit.demo",
    name: "Aarav Sharma",
    username: "demo_talent",
    title: "Software Engineer / AI Developer",
    headline: "Full-Stack Software Engineer & AI Systems Developer | B.Tech CS",
    description: "Explore Orbit as a candidate building verifiable proof of work and discovering opportunities",
    badge: "Talent",
    location: "Bengaluru, Karnataka, India",
  },
  FOUNDER: {
    role: "FOUNDER",
    email: "demo.founder@orbit.demo",
    name: "Riya Mehta",
    username: "demo_founder",
    title: "Founder",
    headline: "Founder & CEO at Nexora Labs | Pre-Seed AI / SaaS",
    description: "Build a venture team, define milestones, and launch opportunities",
    badge: "Founder",
    location: "Mumbai, Maharashtra, India",
    startup: "Nexora Labs",
  },
  RECRUITER: {
    role: "RECRUITER",
    email: "demo.recruiter@orbit.demo",
    name: "Karan Verma",
    username: "demo_recruiter",
    title: "Technical Recruiter",
    headline: "Technical Recruiter at Astra Digital Technologies",
    description: "Discover evidence-backed talent, curate talent pools, and manage candidate pipelines",
    badge: "Recruiter",
    location: "Gurugram, Haryana, India",
    organization: "Astra Digital Technologies",
  },
  MENTOR: {
    role: "MENTOR",
    email: "demo.mentor@orbit.demo",
    name: "Dr. Ananya Iyer",
    username: "demo_mentor",
    title: "AI Product & Startup Mentor",
    headline: "Distinguished AI Systems Advisor & Startup Mentor",
    description: "Guide builders and founders through advisory sessions and project reviews",
    badge: "Mentor",
    location: "Chennai, Tamil Nadu, India",
  },
  ORGANIZATION_ADMIN: {
    role: "ORGANIZATION_ADMIN",
    email: "demo.organization@orbit.demo",
    name: "Vikram Malhotra",
    username: "demo_org_admin",
    title: "Organization Admin",
    headline: "Organization Admin & VP of Engineering at Astra Digital Technologies",
    description: "Oversee company profile, team credentials, projects, and scoped hiring",
    badge: "Org Admin",
    location: "Pune, Maharashtra, India",
    organization: "Astra Digital Technologies",
  },
  COMMUNITY_ORGANIZER: {
    role: "COMMUNITY_ORGANIZER",
    email: "demo.organizer@orbit.demo",
    name: "Neha Kapoor",
    username: "demo_organizer",
    title: "Community Organizer",
    headline: "Lead Community Organizer at India Builders Network",
    description: "Run hackathons, host ecosystem events, and nurture developer communities",
    badge: "Organizer",
    location: "Noida, Uttar Pradesh, India",
    organization: "India Builders Network",
  },
  PLATFORM_ADMIN: {
    role: "PLATFORM_ADMIN",
    email: "demo.admin@orbit.demo",
    name: "Aditya Rao",
    username: "demo_admin",
    title: "Platform Admin",
    headline: "Orbit Platform Administrator",
    description: "Monitor platform operations, audit logs, organization verification, and moderation",
    badge: "Admin",
    location: "Hyderabad, Telangana, India",
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
