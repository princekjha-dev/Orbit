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

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [serverError, setServerError] = useState<string>("");

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
        if (authError.message.toLowerCase().includes("email not confirmed")) {
          setServerError("Please verify your email address before signing in.");
        } else {
          setServerError("Invalid email or password.");
        }
        return;
      }

      // 2. Sync NextAuth session for hybrid backwards-compatibility
      try {
        await nextAuthSignIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
      } catch {
        // Fallback silently if NextAuth credentials don't match; Supabase SSR session is active
      }

      // 3. Navigate to dashboard or requested callback URL
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred during sign in.");
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Sign in to Orbit</h1>
        <p className="text-sm text-neutral-500 mt-1">
          No account yet?{" "}
          <Link href="/signup" className="text-brand-600 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>

      {registered && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-3">
          <p className="text-xs text-green-700 font-medium">
            Account created successfully. Sign in to continue.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-neutral-700">Password</span>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-600 hover:text-brand-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3" role="alert">
            <p className="text-xs text-red-700">{serverError}</p>
          </div>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <DemoAccountSwitcher />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-neutral-500 py-8 text-center">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
