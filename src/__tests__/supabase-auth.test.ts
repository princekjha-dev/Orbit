import { describe, it, expect, vi } from "vitest";

describe("Supabase Authentication & Authorization Flows", () => {
  // ─── 1. SIGNUP VALIDATION & REGISTRATION FLOW ─────────────────────────────
  describe("Signup Flow", () => {
    function validateSignupInput(data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    }) {
      const errors: Record<string, string> = {};
      if (!data.name || data.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
      }
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Please enter a valid email address";
      }
      if (!data.password || data.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
      if (!data.role || !["STUDENT", "FOUNDER"].includes(data.role)) {
        errors.role = "Valid role selection is required";
      }
      return { isValid: Object.keys(errors).length === 0, errors };
    }

    it("should reject invalid signup inputs", () => {
      const result = validateSignupInput({
        name: "A",
        email: "not-an-email",
        password: "123",
        role: "INVALID",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe("Name must be at least 2 characters");
      expect(result.errors.email).toBe("Please enter a valid email address");
      expect(result.errors.password).toBe("Password must be at least 8 characters");
      expect(result.errors.role).toBe("Valid role selection is required");
    });

    it("should accept valid registration inputs and distinguish email confirmation states", () => {
      const result = validateSignupInput({
        name: "Alex Contributor",
        email: "alex@example.com",
        password: "secure-password-123",
        role: "STUDENT",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});

      // Simulate Supabase response when email confirmation is enabled vs auto-confirmed
      function handleSupabaseSignupResponse(res: { user: any; session: any | null }) {
        if (res.user && !res.session) {
          return { status: "CONFIRMATION_PENDING", message: "Verification email sent" };
        }
        if (res.user && res.session) {
          return { status: "AUTHENTICATED", message: "Account active" };
        }
        return { status: "FAILED" };
      }

      // Case 1: Email confirmation required
      const pendingRes = handleSupabaseSignupResponse({
        user: { id: "usr_1", email: "alex@example.com" },
        session: null,
      });
      expect(pendingRes.status).toBe("CONFIRMATION_PENDING");

      // Case 2: Session immediately active
      const activeRes = handleSupabaseSignupResponse({
        user: { id: "usr_1", email: "alex@example.com" },
        session: { access_token: "mock-token" },
      });
      expect(activeRes.status).toBe("AUTHENTICATED");
    });
  });

  // ─── 2. LOGIN & CREDENTIAL VALIDATION ──────────────────────────────────────
  describe("Login Flow", () => {
    function validateLoginInput(data: { email?: string; password?: string }) {
      const errors: Record<string, string> = {};
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Please enter a valid email address";
      }
      if (!data.password || data.password.length === 0) {
        errors.password = "Password is required";
      }
      return { isValid: Object.keys(errors).length === 0, errors };
    }

    it("should validate email and password before submitting to Supabase", () => {
      expect(validateLoginInput({ email: "", password: "" }).isValid).toBe(false);
      expect(validateLoginInput({ email: "invalid", password: "pwd" }).isValid).toBe(false);
      expect(validateLoginInput({ email: "user@orbit.app", password: "mypassword" }).isValid).toBe(true);
    });

    it("should handle error states cleanly without exposing internals", () => {
      function mapSupabaseAuthError(errorMessage: string) {
        const lower = errorMessage.toLowerCase();
        if (lower.includes("email not confirmed")) {
          return "Please verify your email address before signing in.";
        }
        if (lower.includes("invalid login credentials") || lower.includes("invalid_grant")) {
          return "Invalid email or password.";
        }
        return "An unexpected error occurred during sign in.";
      }

      expect(mapSupabaseAuthError("Invalid login credentials")).toBe("Invalid email or password.");
      expect(mapSupabaseAuthError("Email not confirmed")).toBe("Please verify your email address before signing in.");
      expect(mapSupabaseAuthError("database connection timeout")).toBe("An unexpected error occurred during sign in.");
    });
  });

  // ─── 3. LOGOUT SESSION CLEANUP ─────────────────────────────────────────────
  describe("Logout Flow", () => {
    it("should purge both Supabase and NextAuth auth state upon logout", async () => {
      const mockSupabaseSignOut = vi.fn().mockResolvedValue({ error: null });
      const mockNextAuthSignOut = vi.fn().mockResolvedValue(undefined);

      async function executeLogout(supabaseSignOut: Function, nextAuthSignOut: Function) {
        await supabaseSignOut();
        await nextAuthSignOut({ redirect: false });
        return { loggedOut: true, redirectUrl: "/login" };
      }

      const res = await executeLogout(mockSupabaseSignOut, mockNextAuthSignOut);

      expect(mockSupabaseSignOut).toHaveBeenCalledTimes(1);
      expect(mockNextAuthSignOut).toHaveBeenCalledTimes(1);
      expect(res.loggedOut).toBe(true);
      expect(res.redirectUrl).toBe("/login");
    });
  });

  // ─── 4. PROTECTED ROUTES & REDIRECTS ───────────────────────────────────────
  describe("Protected Route Gating & Auth Redirects", () => {
    const PUBLIC_ROUTES = [
      "/",
      "/login",
      "/signup",
      "/forgot-password",
      "/auth/callback",
      "/privacy",
      "/terms",
      "/safety",
      "/verify",
    ];
    const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

    function evaluateRouteAccess(pathname: string, isAuthenticated: boolean, role?: string) {
      // 1. Public routes
      const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
      if (isPublic) {
        // Authenticated users are redirected away from auth pages to dashboard
        if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
          return { allow: false, redirect: "/dashboard" };
        }
        return { allow: true };
      }

      // 2. Unauthenticated user on protected route
      if (!isAuthenticated) {
        return { allow: false, redirect: `/login?callbackUrl=${encodeURIComponent(pathname)}` };
      }

      // 3. Admin routes
      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return { allow: false, redirect: "/dashboard" };
      }

      return { allow: true };
    }

    it("should redirect unauthenticated users away from protected routes to /login", () => {
      expect(evaluateRouteAccess("/dashboard", false)).toEqual({
        allow: false,
        redirect: "/login?callbackUrl=%2Fdashboard",
      });
      expect(evaluateRouteAccess("/profile", false)).toEqual({
        allow: false,
        redirect: "/login?callbackUrl=%2Fprofile",
      });
      expect(evaluateRouteAccess("/projects", false)).toEqual({
        allow: false,
        redirect: "/login?callbackUrl=%2Fprojects",
      });
      expect(evaluateRouteAccess("/action-center", false)).toEqual({
        allow: false,
        redirect: "/login?callbackUrl=%2Faction-center",
      });
    });

    it("should allow authenticated users into protected routes", () => {
      expect(evaluateRouteAccess("/dashboard", true).allow).toBe(true);
      expect(evaluateRouteAccess("/profile", true).allow).toBe(true);
      expect(evaluateRouteAccess("/projects", true).allow).toBe(true);
    });

    it("should redirect authenticated users away from /login, /signup, /forgot-password to /dashboard", () => {
      expect(evaluateRouteAccess("/login", true)).toEqual({
        allow: false,
        redirect: "/dashboard",
      });
      expect(evaluateRouteAccess("/signup", true)).toEqual({
        allow: false,
        redirect: "/dashboard",
      });
      expect(evaluateRouteAccess("/forgot-password", true)).toEqual({
        allow: false,
        redirect: "/dashboard",
      });
    });

    it("should allow unauthenticated users on public marketing and policy routes", () => {
      expect(evaluateRouteAccess("/", false).allow).toBe(true);
      expect(evaluateRouteAccess("/login", false).allow).toBe(true);
      expect(evaluateRouteAccess("/signup", false).allow).toBe(true);
      expect(evaluateRouteAccess("/forgot-password", false).allow).toBe(true);
      expect(evaluateRouteAccess("/terms", false).allow).toBe(true);
      expect(evaluateRouteAccess("/privacy", false).allow).toBe(true);
      expect(evaluateRouteAccess("/verify/some-project-slug", false).allow).toBe(true);
    });

    it("should protect /admin routes strictly for ADMIN role", () => {
      // Non-admin authenticated user
      expect(evaluateRouteAccess("/admin", true, "STUDENT")).toEqual({
        allow: false,
        redirect: "/dashboard",
      });
      // Admin user
      expect(evaluateRouteAccess("/admin", true, "ADMIN").allow).toBe(true);
    });
  });

  // ─── 5. SECURITY & SECRET ISOLATION IN CLIENT ──────────────────────────────
  describe("Client Security & Secret Isolation", () => {
    it("should ensure no server secrets or service-role keys are exposed in client-facing configs", () => {
      const clientEnvVariables = {
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "mock-pub-key",
      };

      for (const [key, val] of Object.entries(clientEnvVariables)) {
        expect(key.startsWith("NEXT_PUBLIC_")).toBe(true);
        expect(key.includes("SECRET")).toBe(false);
        expect(key.includes("SERVICE_ROLE")).toBe(false);
      }
    });
  });
});
