"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { loginSchema } from "@/lib/validation/schemas";
import { DemoAccountSwitcher } from "@/components/auth/demo-account-switcher";
import { GoogleButton } from "@/components/auth/google-button";

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/home";
  const urlError = searchParams.get("error");
  const [serverError, setServerError] = useState<string>(urlError || "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (formData: LoginFormData) => {
    setServerError("");

    try {
      const supabase = createClient();

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (formData.email.toLowerCase().endsWith("@orbit.demo")) {
          try {
            const demoRole = (["TALENT", "FOUNDER", "RECRUITER", "MENTOR", "ORGANIZATION_ADMIN", "COMMUNITY_ORGANIZER", "PLATFORM_ADMIN"] as const).find(
              (r) => formData.email.toLowerCase().includes(r.toLowerCase().replace("_", "")) ||
                     formData.email.toLowerCase() === `demo.${r.toLowerCase().replace("_", "")}@orbit.demo` ||
                     formData.email.toLowerCase() === `demo.${r === "ORGANIZATION_ADMIN" ? "organization" : r === "COMMUNITY_ORGANIZER" ? "organizer" : r === "PLATFORM_ADMIN" ? "admin" : r.toLowerCase()}@orbit.demo`
            );

            if (demoRole) {
              const demoRes = await fetch("/api/auth/demo-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: demoRole }),
              });
              const demoData = await demoRes.json();
              if (demoRes.ok && demoData.success) {
                if (demoData.offlineMode) {
                  await nextAuthSignIn("credentials", {
                    email: demoData.email,
                    password: demoData.password,
                    redirect: false,
                  });
                }
                if (demoData.session) {
                  try {
                    await supabase.auth.setSession(demoData.session);
                  } catch {}
                }
                window.location.href = demoData.redirectUrl || "/dashboard";
                return;
              }
            }
          } catch {}
        }

        if (authError.message.toLowerCase().includes("email not confirmed")) {
          setServerError("Please verify your email address before signing in.");
        } else {
          setServerError("Invalid email or password.");
        }
        return;
      }

      // 2. Sync NextAuth session for backwards compatibility
      try {
        await nextAuthSignIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
      } catch {
        // Fallback silently if NextAuth credentials don't match; Supabase SSR session is active
      }

      // 3. Check onboarding completion and navigate appropriately
      const isDemo = formData.email.toLowerCase().endsWith("@orbit.demo");
      const isMetadataOnboarded = authData.user?.user_metadata?.onboarding_completed === true;
      let isOnboarded = isDemo || isMetadataOnboarded;

      if (!isOnboarded) {
        try {
          const statusRes = await fetch("/api/onboarding");
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.onboardingCompleted) {
              isOnboarded = true;
            }
          }
        } catch {
          // Ignore check error
        }
      }

      const destination = isOnboarded
        ? (callbackUrl && callbackUrl !== "/onboarding" ? callbackUrl : "/home")
        : "/onboarding";

      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred during sign in.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          Welcome back.
        </h1>
        <p className="text-[13.5px] text-[#6E6E73]">
          Sign in to access your Orbit workspace.
        </p>
      </div>

      {registered && (
        <div className="rounded-xl bg-[#E8F8EE] border border-[#C1EAD0] px-3.5 py-2.5">
          <p className="text-xs text-[#1D7F3E] font-medium text-center">
            Account created successfully. Sign in to continue.
          </p>
        </div>
      )}

      {/* Google Authentication Option */}
      <div className="space-y-3">
        <GoogleButton
          mode="signin"
          callbackUrl={callbackUrl}
          onError={(err) => setServerError(err)}
        />
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-[#E5E5EA] w-full" />
          <span className="bg-white px-2.5 text-[11px] text-[#86868B] uppercase tracking-wider absolute">
            Or with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
        <div>
          <label className="block text-[12px] font-medium text-[#48484A] mb-1">
            Email address
          </label>
          <input
            type="email"
            autoComplete="email"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-[13.5px] text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
            placeholder="you@domain.com"
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-xs text-[#FF3B30] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[12px] font-medium text-[#48484A]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-[#0071E3] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-[13.5px] text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
            {...register("password")}
          />
          {errors.password?.message && (
            <p className="text-xs text-[#FF3B30] mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-xl bg-[#FDEEEF] border border-[#F9CBD0] px-3.5 py-2.5" role="alert">
            <p className="text-xs text-[#C42B37]">{serverError}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 rounded-xl text-[14px]"
          loading={isSubmitting}
        >
          Continue
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-[#6E6E73]">
        Don't have an account?{" "}
        <Link href="/signup" className="text-[#0071E3] font-medium hover:underline">
          Create account
        </Link>
      </div>

      <div className="pt-2 border-t border-[#F0F0F2]">
        <DemoAccountSwitcher />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[#86868B] py-8 text-center">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
