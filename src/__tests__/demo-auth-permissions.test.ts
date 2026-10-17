import { describe, it, expect } from "vitest";
import {
  DEMO_ACCOUNTS,
  DEMO_ROLE_LIST,
  isDemoEmail,
  getDemoAccountByEmail,
  getDemoAccountByRole,
  OrbitRole,
} from "@/lib/auth/roles";
import {
  can,
  resolveOrbitRole,
  ROLE_CAPABILITIES,
  Capability,
} from "@/lib/auth/permissions";

describe("Demo Accounts & Role-Based Authorization System", () => {
  // ─── 1. ALL 7 DEMO ACCOUNTS CONFIGURED ─────────────────────────────────────
  describe("Demo Role & Account Definitions", () => {
    it("should include all 7 required demo roles", () => {
      const requiredRoles: OrbitRole[] = [
        "TALENT",
        "FOUNDER",
        "RECRUITER",
        "MENTOR",
        "ORGANIZATION_ADMIN",
        "COMMUNITY_ORGANIZER",
        "PLATFORM_ADMIN",
      ];

      expect(DEMO_ROLE_LIST).toHaveLength(7);
      requiredRoles.forEach((role) => {
        expect(DEMO_ROLE_LIST).toContain(role);
        expect(DEMO_ACCOUNTS[role]).toBeDefined();
        expect(DEMO_ACCOUNTS[role].email).toMatch(/@orbit\.demo$/);
        expect(DEMO_ACCOUNTS[role].name).toBeTruthy();
        expect(DEMO_ACCOUNTS[role].title).toBeTruthy();
        expect(DEMO_ACCOUNTS[role].description).toBeTruthy();
      });
    });

    it("should correctly identify demo emails", () => {
      expect(isDemoEmail("demo.talent@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.founder@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.recruiter@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.mentor@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.organization@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.organizer@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.admin@orbit.demo")).toBe(true);

      expect(isDemoEmail("realuser@gmail.com")).toBe(false);
      expect(isDemoEmail("attacker@orbit.demo.com")).toBe(false);
      expect(isDemoEmail(null)).toBe(false);
      expect(isDemoEmail(undefined)).toBe(false);
    });

    it("should retrieve demo account by email and role", () => {
      const talentAcc = getDemoAccountByEmail("demo.talent@orbit.demo");
      expect(talentAcc?.role).toBe("TALENT");
      expect(talentAcc?.name).toBe("Alex Rivera");

      const adminAcc = getDemoAccountByRole("PLATFORM_ADMIN");
      expect(adminAcc.email).toBe("demo.admin@orbit.demo");
      expect(adminAcc.badge).toBe("Admin");
    });
  });

  // ─── 2. ROLE RESOLUTION ENGINE ─────────────────────────────────────────────
  describe("Role Resolution Logic", () => {
    it("should resolve role from demo email", () => {
      expect(resolveOrbitRole({ email: "demo.talent@orbit.demo" })).toBe("TALENT");
      expect(resolveOrbitRole({ email: "demo.founder@orbit.demo" })).toBe("FOUNDER");
      expect(resolveOrbitRole({ email: "demo.recruiter@orbit.demo" })).toBe("RECRUITER");
      expect(resolveOrbitRole({ email: "demo.mentor@orbit.demo" })).toBe("MENTOR");
      expect(resolveOrbitRole({ email: "demo.organization@orbit.demo" })).toBe("ORGANIZATION_ADMIN");
      expect(resolveOrbitRole({ email: "demo.organizer@orbit.demo" })).toBe("COMMUNITY_ORGANIZER");
      expect(resolveOrbitRole({ email: "demo.admin@orbit.demo" })).toBe("PLATFORM_ADMIN");
    });

    it("should resolve role from Supabase user_metadata", () => {
      const user = {
        email: "custom@example.com",
        user_metadata: { orbitRole: "RECRUITER" as OrbitRole },
      };
      expect(resolveOrbitRole(user)).toBe("RECRUITER");
    });

    it("should resolve role from Prisma database roles and relations", () => {
      expect(resolveOrbitRole({ role: "ADMIN" })).toBe("PLATFORM_ADMIN");
      expect(resolveOrbitRole({ role: "FOUNDER" })).toBe("FOUNDER");

      // Org owner
      expect(
        resolveOrbitRole({
          role: "STUDENT",
          organizations: [{ role: "OWNER" }],
        })
      ).toBe("ORGANIZATION_ADMIN");

      // Active mentor
      expect(
        resolveOrbitRole({
          role: "STUDENT",
          mentorProfile: { id: "m-1", isActive: true },
        })
      ).toBe("MENTOR");

      // Default fallback
      expect(resolveOrbitRole({ role: "STUDENT" })).toBe("TALENT");
      expect(resolveOrbitRole(null)).toBe("TALENT");
    });
  });

  // ─── 3. CENTRALIZED CAPABILITY AUTHORIZATION (can) ─────────────────────────
  describe("Capability Checks (can)", () => {
    it("TALENT: can apply & submit deliverables, but cannot manage pools or verify orgs", () => {
      const talent = { orbitRole: "TALENT" as OrbitRole };

      expect(can(talent, "APPLY_OPPORTUNITY")).toBe(true);
      expect(can(talent, "SUBMIT_PROJECT_DELIVERABLE")).toBe(true);
      expect(can(talent, "REQUEST_MENTORSHIP")).toBe(true);
      expect(can(talent, "VIEW_DASHBOARD")).toBe(true);

      expect(can(talent, "MANAGE_TALENT_POOL")).toBe(false);
      expect(can(talent, "VIEW_CANDIDATES")).toBe(false);
      expect(can(talent, "VERIFY_ORGANIZATION")).toBe(false);
      expect(can(talent, "MODERATE_PLATFORM")).toBe(false);
      expect(can(talent, "VIEW_AUDIT_LOGS")).toBe(false);
    });

    it("FOUNDER: can manage startups & create opportunities, but cannot moderate platform", () => {
      const founder = { orbitRole: "FOUNDER" as OrbitRole };

      expect(can(founder, "MANAGE_STARTUP")).toBe(true);
      expect(can(founder, "CREATE_OPPORTUNITY")).toBe(true);
      expect(can(founder, "MANAGE_PROJECT")).toBe(true);
      expect(can(founder, "VIEW_CANDIDATES")).toBe(true);

      expect(can(founder, "MODERATE_PLATFORM")).toBe(false);
      expect(can(founder, "VERIFY_ORGANIZATION")).toBe(false);
      expect(can(founder, "MANAGE_COMMUNITY")).toBe(false);
      expect(can(founder, "VIEW_AUDIT_LOGS")).toBe(false);
    });

    it("RECRUITER: can manage talent pools & view private evidence, but cannot manage communities", () => {
      const recruiter = { orbitRole: "RECRUITER" as OrbitRole };

      expect(can(recruiter, "VIEW_CANDIDATES")).toBe(true);
      expect(can(recruiter, "MANAGE_TALENT_POOL")).toBe(true);
      expect(can(recruiter, "VIEW_PRIVATE_EVIDENCE")).toBe(true);
      expect(can(recruiter, "CREATE_OPPORTUNITY")).toBe(true);

      expect(can(recruiter, "MANAGE_COMMUNITY")).toBe(false);
      expect(can(recruiter, "MANAGE_STARTUP")).toBe(false);
      expect(can(recruiter, "VERIFY_ORGANIZATION")).toBe(false);
      expect(can(recruiter, "MODERATE_PLATFORM")).toBe(false);
    });

    it("MENTOR: can provide mentorship, but cannot create opportunities or moderate", () => {
      const mentor = { orbitRole: "MENTOR" as OrbitRole };

      expect(can(mentor, "PROVIDE_MENTORSHIP")).toBe(true);
      expect(can(mentor, "SEND_MESSAGE")).toBe(true);

      expect(can(mentor, "CREATE_OPPORTUNITY")).toBe(false);
      expect(can(mentor, "MANAGE_TALENT_POOL")).toBe(false);
      expect(can(mentor, "MODERATE_PLATFORM")).toBe(false);
    });

    it("ORGANIZATION_ADMIN: can manage team & issue credentials, but cannot moderate platform", () => {
      const orgAdmin = { orbitRole: "ORGANIZATION_ADMIN" as OrbitRole };

      expect(can(orgAdmin, "MANAGE_ORGANIZATION_TEAM")).toBe(true);
      expect(can(orgAdmin, "ISSUE_CREDENTIAL")).toBe(true);
      expect(can(orgAdmin, "CREATE_OPPORTUNITY")).toBe(true);
      expect(can(orgAdmin, "MANAGE_PROJECT")).toBe(true);

      expect(can(orgAdmin, "MODERATE_PLATFORM")).toBe(false);
      expect(can(orgAdmin, "VERIFY_ORGANIZATION")).toBe(false);
    });

    it("COMMUNITY_ORGANIZER: can manage communities, events & hackathons", () => {
      const organizer = { orbitRole: "COMMUNITY_ORGANIZER" as OrbitRole };

      expect(can(organizer, "MANAGE_COMMUNITY")).toBe(true);
      expect(can(organizer, "CREATE_EVENT")).toBe(true);
      expect(can(organizer, "CREATE_HACKATHON")).toBe(true);
      expect(can(organizer, "MANAGE_HACKATHON")).toBe(true);

      expect(can(organizer, "MANAGE_TALENT_POOL")).toBe(false);
      expect(can(organizer, "VERIFY_ORGANIZATION")).toBe(false);
      expect(can(organizer, "MODERATE_PLATFORM")).toBe(false);
    });

    it("PLATFORM_ADMIN: possesses comprehensive governance capabilities", () => {
      const admin = { orbitRole: "PLATFORM_ADMIN" as OrbitRole };

      expect(can(admin, "VERIFY_ORGANIZATION")).toBe(true);
      expect(can(admin, "MODERATE_PLATFORM")).toBe(true);
      expect(can(admin, "VIEW_AUDIT_LOGS")).toBe(true);
      expect(can(admin, "VIEW_CANDIDATES")).toBe(true);
      expect(can(admin, "MANAGE_TALENT_POOL")).toBe(true);
    });
  });

  // ─── 4. SECURITY & PERMISSION ENFORCEMENT ──────────────────────────────────
  describe("Security Guarantees", () => {
    it("should reject null or unauthenticated user checks safely", () => {
      expect(can(null, "VIEW_AUDIT_LOGS")).toBe(false);
      expect(can(undefined, "MODERATE_PLATFORM")).toBe(false);
    });

    it("should never grant admin capabilities to non-admin roles", () => {
      const nonAdminRoles: OrbitRole[] = [
        "TALENT",
        "FOUNDER",
        "RECRUITER",
        "MENTOR",
        "ORGANIZATION_ADMIN",
        "COMMUNITY_ORGANIZER",
      ];

      nonAdminRoles.forEach((role) => {
        expect(can(role, "VERIFY_ORGANIZATION")).toBe(false);
        expect(can(role, "MODERATE_PLATFORM")).toBe(false);
        expect(can(role, "VIEW_AUDIT_LOGS")).toBe(false);
      });
    });
  });

  // ─── 5. OFFLINE / ZERO-CONFIG DEMO DATASETS ───────────────────────────────
  describe("Offline / Zero-Config Demo Mode Datasets", () => {
    it("should provide valid fallback datasets for all 7 roles when offline", async () => {
      const {
        getTalentMockData,
        getFounderMockData,
        getRecruiterMockData,
        getMentorMockData,
        getOrganizationMockData,
        getOrganizerMockData,
        getPlatformAdminMockData,
      } = await import("@/lib/dashboard/mock-data");

      const talentData = getTalentMockData();
      expect(talentData.applications.length).toBeGreaterThan(0);
      expect(talentData.savedOpps.length).toBeGreaterThan(0);
      expect(talentData.verifiedWork.length).toBeGreaterThan(0);

      const founderData = getFounderMockData();
      expect(founderData.startups.length).toBeGreaterThan(0);
      expect(founderData.startups[0].milestones.length).toBeGreaterThan(0);

      const recruiterData = getRecruiterMockData();
      expect(recruiterData.orgMemberships.length).toBeGreaterThan(0);
      expect(recruiterData.applications.length).toBeGreaterThan(0);

      const mentorData = getMentorMockData();
      expect(mentorData.profile.expertiseAreas.length).toBeGreaterThan(0);
      expect(mentorData.sessions.length).toBeGreaterThan(0);

      const orgData = getOrganizationMockData();
      expect(orgData.memberships.length).toBeGreaterThan(0);
      expect(orgData.memberships[0].organization.opportunities.length).toBeGreaterThan(0);

      const organizerData = getOrganizerMockData();
      expect(organizerData.communities.length).toBeGreaterThan(0);
      expect(organizerData.events.length).toBeGreaterThan(0);

      const adminData = getPlatformAdminMockData();
      expect(adminData.userCount).toBeGreaterThan(0);
      expect(adminData.pendingVerifications.length).toBeGreaterThan(0);
    });
  });
});
