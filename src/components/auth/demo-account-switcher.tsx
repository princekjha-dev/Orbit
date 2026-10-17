"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { DEMO_ACCOUNTS, DEMO_ROLE_LIST, OrbitRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Rocket,
  Search,
  BookOpen,
  Building2,
  Users2,
  ShieldAlert,
  Loader2,
  ArrowRight,
} from "lucide-react";

const ROLE_ICONS: Record<OrbitRole, React.ComponentType<{ className?: string }>> = {
  TALENT: User,
  FOUNDER: Rocket,
  RECRUITER: Search,
  MENTOR: BookOpen,
  ORGANIZATION_ADMIN: Building2,
  COMMUNITY_ORGANIZER: Users2,
  PLATFORM_ADMIN: ShieldAlert,
};

const ROLE_SHORT_DESCRIPTIONS: Record<OrbitRole, string> = {
  TALENT: "Explore Orbit as a job seeker",
  FOUNDER: "Build a team and launch opportunities",
  RECRUITER: "Discover evidence-backed talent",
  MENTOR: "Support people and projects",
  ORGANIZATION_ADMIN: "Manage hiring and opportunities",
  COMMUNITY_ORGANIZER: "Run events and hackathons",
  PLATFORM_ADMIN: "Explore platform management",
};

interface DemoAccountSwitcherProps {
  compact?: boolean;
}

export function DemoAccountSwitcher({ compact = false }: DemoAccountSwitcherProps) {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<OrbitRole | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Safe environment check: hide in production unless explicit demo flag is active
  const isDemoVisible =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoVisible) {
    return null;
  }

  const handleDemoSignIn = async (role: OrbitRole) => {
    setLoadingRole(role);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to sign in as ${role}.`);
      }

      // If offlineMode is active, establish client NextAuth session
      if (data.offlineMode) {
        await nextAuthSignIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
      }

      // Sync browser Supabase client session if available
      if (data.session) {
        try {
          const supabase = createClient();
          await supabase.auth.setSession(data.session);
        } catch {
          // SSR cookies are already set by server handler
        }
      }

      // Full navigation to ensure fresh authenticated SSR session
      window.location.href = data.redirectUrl || "/dashboard";
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while switching demo accounts.");
      setLoadingRole(null);
    }
  };

  if (compact) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
            Switch Demo Persona
          </span>
        </div>

        {errorMessage && (
          <p className="text-[11px] text-red-600 mb-2 leading-tight">{errorMessage}</p>
        )}

        <div className="grid grid-cols-2 gap-1.5">
          {DEMO_ROLE_LIST.map((role) => {
            const config = DEMO_ACCOUNTS[role];
            const Icon = ROLE_ICONS[role];
            const isLoading = loadingRole === role;

            return (
              <button
                key={role}
                type="button"
                disabled={loadingRole !== null}
                onClick={() => handleDemoSignIn(role)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 disabled:opacity-50 transition-colors text-left"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600 shrink-0" />
                ) : (
                  <Icon className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                )}
                <span className="truncate">{config.badge}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-neutral-200">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
          Explore Orbit with a demo account
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Select a role below to explore the platform with real Supabase authentication and contextual workflows.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        {DEMO_ROLE_LIST.map((role) => {
          const config = DEMO_ACCOUNTS[role];
          const Icon = ROLE_ICONS[role];
          const desc = ROLE_SHORT_DESCRIPTIONS[role];
          const isLoading = loadingRole === role;

          return (
            <button
              key={role}
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleDemoSignIn(role)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all text-left disabled:opacity-50 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-8 w-8 rounded-md bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                  ) : (
                    <Icon className="h-4 w-4 text-neutral-600 group-hover:text-brand-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900">
                      {config.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {config.email}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {desc}
                  </p>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
