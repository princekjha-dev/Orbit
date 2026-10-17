import { OrbitRole, DEMO_ACCOUNTS } from "./roles";

/**
 * Granular Capabilities across Orbit.
 * Instead of checking string roles throughout the app, components and API routes
 * query `can(user, capability)`.
 */
export type Capability =
  | "VIEW_DASHBOARD"
  | "VIEW_PUBLIC_PROFILE"
  | "EDIT_OWN_PROFILE"
  | "APPLY_OPPORTUNITY"
  | "CREATE_OPPORTUNITY"
  | "MANAGE_OWN_OPPORTUNITY"
  | "VIEW_CANDIDATES"
  | "MANAGE_TALENT_POOL"
  | "CREATE_PROJECT"
  | "MANAGE_PROJECT"
  | "SUBMIT_PROJECT_DELIVERABLE"
  | "VIEW_PRIVATE_EVIDENCE"
  | "SEND_MESSAGE"
  | "MANAGE_COMMUNITY"
  | "CREATE_EVENT"
  | "MANAGE_EVENT"
  | "CREATE_HACKATHON"
  | "MANAGE_HACKATHON"
  | "PROVIDE_MENTORSHIP"
  | "REQUEST_MENTORSHIP"
  | "MANAGE_STARTUP"
  | "VERIFY_ORGANIZATION"
  | "MODERATE_PLATFORM"
  | "VIEW_AUDIT_LOGS"
  | "MANAGE_ORGANIZATION_TEAM"
  | "ISSUE_CREDENTIAL";

/**
 * Role to Capability Matrix.
 */
export const ROLE_CAPABILITIES: Record<OrbitRole, readonly Capability[]> = {
  TALENT: [
    "VIEW_DASHBOARD",
    "VIEW_PUBLIC_PROFILE",
    "EDIT_OWN_PROFILE",
    "APPLY_OPPORTUNITY",
    "SUBMIT_PROJECT_DELIVERABLE",
    "REQUEST_MENTORSHIP",
    "SEND_MESSAGE",
  ],
  FOUNDER: [
    "VIEW_DASHBOARD",
    "VIEW_PUBLIC_PROFILE",
    "EDIT_OWN_PROFILE",
    "MANAGE_STARTUP",
    "CREATE_OPPORTUNITY",
    "MANAGE_OWN_OPPORTUNITY",
    "CREATE_PROJECT",
    "MANAGE_PROJECT",
    "VIEW_CANDIDATES",
    "REQUEST_MENTORSHIP",
    "SEND_MESSAGE",
  ],
  RECRUITER: [
    "VIEW_DASHBOARD",
    "VIEW_PUBLIC_PROFILE",
    "EDIT_OWN_PROFILE",
    "CREATE_OPPORTUNITY",
    "MANAGE_OWN_OPPORTUNITY",
    "VIEW_CANDIDATES",
    "MANAGE_TALENT_POOL",
    "VIEW_PRIVATE_EVIDENCE",
    "SEND_MESSAGE",
  ],
  MENTOR: [
    "VIEW_DASHBOARD",
    "VIEW_PUBLIC_PROFILE",
    "EDIT_OWN_PROFILE",
    "PROVIDE_MENTORSHIP",
    "SEND_MESSAGE",
  ],
  ORGANIZATION_ADMIN: [
    "VIEW_DASHBOARD",
    "VIEW_PUBLIC_PROFILE",
    "EDIT_OWN_PROFILE",
    "CREATE_OPPORTUNITY",
    "MANAGE_OWN_OPPORTUNITY",
    "VIEW_CANDIDATES",
    "MANAGE_TALENT_POOL",
    "CREATE_PROJECT",
    "MANAGE_PROJECT",
    "MANAGE_ORGANIZATION_TEAM",
    "ISSUE_CREDENTIAL",
    "SEND_MESSAGE",
  ],
  COMMUNITY_ORGANIZER: [
    "VIEW_DASHBOARD",
    "VIEW_PUBLIC_PROFILE",
    "EDIT_OWN_PROFILE",
    "MANAGE_COMMUNITY",
    "CREATE_EVENT",
    "MANAGE_EVENT",
    "CREATE_HACKATHON",
    "MANAGE_HACKATHON",
    "SEND_MESSAGE",
  ],
  PLATFORM_ADMIN: [
    "VIEW_DASHBOARD",
    "VIEW_PUBLIC_PROFILE",
    "EDIT_OWN_PROFILE",
    "CREATE_OPPORTUNITY",
    "MANAGE_OWN_OPPORTUNITY",
    "VIEW_CANDIDATES",
    "MANAGE_TALENT_POOL",
    "CREATE_PROJECT",
    "MANAGE_PROJECT",
    "SUBMIT_PROJECT_DELIVERABLE",
    "VIEW_PRIVATE_EVIDENCE",
    "SEND_MESSAGE",
    "MANAGE_COMMUNITY",
    "CREATE_EVENT",
    "MANAGE_EVENT",
    "CREATE_HACKATHON",
    "MANAGE_HACKATHON",
    "PROVIDE_MENTORSHIP",
    "REQUEST_MENTORSHIP",
    "MANAGE_STARTUP",
    "VERIFY_ORGANIZATION",
    "MODERATE_PLATFORM",
    "VIEW_AUDIT_LOGS",
    "MANAGE_ORGANIZATION_TEAM",
    "ISSUE_CREDENTIAL",
  ],
};

export interface UserContext {
  id?: string;
  email?: string | null;
  role?: string | null;
  user_metadata?: Record<string, any>;
  orbitRole?: OrbitRole;
  organizations?: Array<{ role: string }>;
  mentorProfile?: { id: string; isVerified?: boolean; isActive?: boolean } | null;
}

/**
 * Resolves the primary OrbitRole for a user based on DB relations and metadata.
 */
export function resolveOrbitRole(user: UserContext | null | undefined): OrbitRole {
  if (!user) return "TALENT";

  // 1. Direct explicit orbitRole
  if (user.orbitRole) return user.orbitRole;

  // 2. Check metadata from Supabase
  if (user.user_metadata?.orbitRole) {
    return user.user_metadata.orbitRole as OrbitRole;
  }

  // 3. Match demo emails
  if (user.email) {
    const emailLower = user.email.toLowerCase();
    for (const [r, cfg] of Object.entries(DEMO_ACCOUNTS)) {
      if (cfg.email.toLowerCase() === emailLower) {
        return r as OrbitRole;
      }
    }
  }

  // 4. Prisma database role matching
  if (user.role === "ADMIN") return "PLATFORM_ADMIN";
  if (user.role === "FOUNDER") return "FOUNDER";

  // 5. Relationship-based inference
  if (user.organizations && user.organizations.length > 0) {
    const isOwner = user.organizations.some(
      (m) => m.role === "OWNER" || m.role === "ADMIN"
    );
    if (isOwner) return "ORGANIZATION_ADMIN";
  }

  if (user.mentorProfile && user.mentorProfile.isActive !== false) {
    return "MENTOR";
  }

  return "TALENT";
}

/**
 * Checks whether the given user or role possesses the specified capability.
 */
export function can(
  userOrRole: UserContext | OrbitRole | null | undefined,
  capability: Capability
): boolean {
  if (!userOrRole) return false;

  const role: OrbitRole =
    typeof userOrRole === "string" ? (userOrRole as OrbitRole) : resolveOrbitRole(userOrRole);

  const capabilities = ROLE_CAPABILITIES[role];
  if (!capabilities) return false;

  return capabilities.includes(capability);
}
