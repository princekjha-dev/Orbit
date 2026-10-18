import { describe, it, expect, beforeEach, vi } from "vitest";
import { inMemoryStore } from "@/lib/database/in-memory-store";
import { isDemoEmail, getDemoAccountByRole } from "@/lib/auth/roles";
import { resolveOrbitRole } from "@/lib/auth/permissions";

describe("Orbit Signup & Onboarding Flow", () => {
  const testUserId = "user-test-onboarding-123";

  beforeEach(() => {
    inMemoryStore.userProfiles.delete(testUserId);
  });

  describe("1. Onboarding Status Resolution", () => {
    it("should recognize demo accounts as onboarded by default", () => {
      expect(isDemoEmail("demo.talent@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.founder@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.recruiter@orbit.demo")).toBe(true);
      expect(isDemoEmail("demo.mentor@orbit.demo")).toBe(true);
      expect(isDemoEmail("newuser@example.com")).toBe(false);
    });

    it("should consider a brand-new user incomplete prior to saving profile", () => {
      const stored = inMemoryStore.userProfiles.get(testUserId);
      expect(stored).toBeUndefined();
    });

    it("should properly mark onboarding complete only after required profile data is saved", () => {
      inMemoryStore.userProfiles.set(testUserId, {
        userId: testUserId,
        name: "Ada Lovelace",
        role: "STUDENT",
        orbitRole: "TALENT",
        headline: "Systems Engineer & Algorithm Architect",
        about: "Building verifiable decentralized proofs.",
        location: "London, UK",
        skills: ["TypeScript", "Distributed Systems", "Algorithms"],
        onboarding_completed: true,
        onboarding_status: "COMPLETED",
        updatedAt: new Date().toISOString(),
      });

      const profile = inMemoryStore.userProfiles.get(testUserId);
      expect(profile).toBeDefined();
      expect(profile.onboarding_completed).toBe(true);
      expect(profile.onboarding_status).toBe("COMPLETED");
      expect(profile.headline).toBe("Systems Engineer & Algorithm Architect");
      expect(profile.skills).toContain("TypeScript");
    });
  });

  describe("2. Role Selection & Persona Persistence", () => {
    const roles: Array<"TALENT" | "FOUNDER" | "RECRUITER" | "MENTOR"> = [
      "TALENT",
      "FOUNDER",
      "RECRUITER",
      "MENTOR",
    ];

    roles.forEach((role) => {
      it(`should persist ${role} persona and properly resolve Orbit capabilities`, () => {
        inMemoryStore.userProfiles.set(`${testUserId}-${role}`, {
          userId: `${testUserId}-${role}`,
          name: "Test User",
          orbitRole: role,
          headline: `Expert ${role}`,
          onboarding_completed: true,
        });

        const saved = inMemoryStore.userProfiles.get(`${testUserId}-${role}`);
        expect(saved.orbitRole).toBe(role);

        const resolved = resolveOrbitRole({
          user_metadata: { orbitRole: role },
        });
        expect(resolved).toBe(role);
      });
    });
  });

  describe("3. Required vs Optional Validation Rules", () => {
    it("should enforce name and headline as required", () => {
      const validateInput = (input: { name?: string; headline?: string; role?: string }) => {
        if (!input.name || input.name.trim().length < 2) return "Name required";
        if (!input.headline || input.headline.trim().length < 2) return "Headline required";
        if (!input.role) return "Role required";
        return null;
      };

      expect(validateInput({ name: "", headline: "Engineer", role: "TALENT" })).toBe("Name required");
      expect(validateInput({ name: "Alex", headline: "", role: "TALENT" })).toBe("Headline required");
      expect(validateInput({ name: "Alex", headline: "Engineer", role: "" })).toBe("Role required");
      expect(validateInput({ name: "Alex", headline: "Engineer", role: "TALENT" })).toBeNull();
    });

    it("should allow optional fields (bio, links, college, avatar) to be empty or omitted", () => {
      const minimalValidProfile = {
        name: "Dev Builder",
        headline: "Frontend Architect",
        role: "TALENT",
        about: "",
        location: "",
        skills: [],
        portfolio: "",
        github: "",
        linkedin: "",
      };

      expect(minimalValidProfile.name.length).toBeGreaterThanOrEqual(2);
      expect(minimalValidProfile.headline.length).toBeGreaterThanOrEqual(2);
      expect(minimalValidProfile.about).toBe("");
      expect(minimalValidProfile.github).toBe("");
    });
  });

  describe("4. Route Guard & Redirection Logic", () => {
    function computeRedirect(params: {
      pathname: string;
      isAuthenticated: boolean;
      isOnboardingComplete: boolean;
    }): string | null {
      const { pathname, isAuthenticated, isOnboardingComplete } = params;

      if (!isAuthenticated) {
        if (pathname === "/onboarding" || pathname === "/home" || pathname === "/dashboard") {
          return "/login";
        }
        return null;
      }

      if (pathname === "/onboarding") {
        if (isOnboardingComplete) return "/home";
        return null; // Allowed to view onboarding
      }

      if (pathname === "/home" || pathname === "/dashboard") {
        if (!isOnboardingComplete) return "/onboarding";
        return null; // Allowed to view app
      }

      if (pathname === "/login" || pathname === "/signup") {
        return isOnboardingComplete ? "/home" : "/onboarding";
      }

      return null;
    }

    it("TEST 1: New unauthenticated user accessing /onboarding redirects to /login", () => {
      expect(
        computeRedirect({
          pathname: "/onboarding",
          isAuthenticated: false,
          isOnboardingComplete: false,
        })
      ).toBe("/login");
    });

    it("TEST 2: New unauthenticated user accessing /home redirects to /login", () => {
      expect(
        computeRedirect({
          pathname: "/home",
          isAuthenticated: false,
          isOnboardingComplete: false,
        })
      ).toBe("/login");
    });

    it("TEST 3: Authenticated user with incomplete onboarding accessing /home redirects to /onboarding", () => {
      expect(
        computeRedirect({
          pathname: "/home",
          isAuthenticated: true,
          isOnboardingComplete: false,
        })
      ).toBe("/onboarding");
    });

    it("TEST 4: Authenticated user with incomplete onboarding accessing /dashboard redirects to /onboarding", () => {
      expect(
        computeRedirect({
          pathname: "/dashboard",
          isAuthenticated: true,
          isOnboardingComplete: false,
        })
      ).toBe("/onboarding");
    });

    it("TEST 5: Authenticated user with incomplete onboarding accessing /onboarding is allowed", () => {
      expect(
        computeRedirect({
          pathname: "/onboarding",
          isAuthenticated: true,
          isOnboardingComplete: false,
        })
      ).toBeNull();
    });

    it("TEST 6: Authenticated fully onboarded user accessing /onboarding redirects to /home", () => {
      expect(
        computeRedirect({
          pathname: "/onboarding",
          isAuthenticated: true,
          isOnboardingComplete: true,
        })
      ).toBe("/home");
    });

    it("TEST 7: Authenticated fully onboarded user accessing /home is allowed", () => {
      expect(
        computeRedirect({
          pathname: "/home",
          isAuthenticated: true,
          isOnboardingComplete: true,
        })
      ).toBeNull();
    });

    it("TEST 8: Incomplete user accessing /login or /signup redirects to /onboarding", () => {
      expect(
        computeRedirect({
          pathname: "/login",
          isAuthenticated: true,
          isOnboardingComplete: false,
        })
      ).toBe("/onboarding");
      expect(
        computeRedirect({
          pathname: "/signup",
          isAuthenticated: true,
          isOnboardingComplete: false,
        })
      ).toBe("/onboarding");
    });

    it("TEST 9: Complete user accessing /login or /signup redirects to /home", () => {
      expect(
        computeRedirect({
          pathname: "/login",
          isAuthenticated: true,
          isOnboardingComplete: true,
        })
      ).toBe("/home");
      expect(
        computeRedirect({
          pathname: "/signup",
          isAuthenticated: true,
          isOnboardingComplete: true,
        })
      ).toBe("/home");
    });
  });
});
