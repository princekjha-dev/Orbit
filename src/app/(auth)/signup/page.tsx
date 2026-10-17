"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Mail } from "lucide-react";

const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "FOUNDER"]),
});

type SignupFormData = z.infer<typeof signupFormSchema>;

const roles = [
  {
    value: "STUDENT",
    title: "Student / Contributor",
    description: "Discover opportunities, complete scoped projects, and build verifiable evidence.",
  },
  {
    value: "FOUNDER",
    title: "Founder / Organization",
    description: "Publish opportunities, run scoped projects, and manage verified teams.",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "FOUNDER">("STUDENT");
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { role: "STUDENT" },
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    setVerificationPendingEmail(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`;

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) {
        setServerError(authError.message);
        return;
      }

      // 2. Check if email verification is required
      if (authData.user && !authData.session) {
        setVerificationPendingEmail(data.email);
        return;
      }

      // 3. If session is immediately available, initialize Orbit database profile
      if (authData.session) {
        const initRes = await fetch("/api/auth/init-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            role: data.role,
          }),
        });

        if (!initRes.ok) {
          console.warn("Profile init warning: will resolve on next request.");
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login?registered=1");
      }
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred during registration.");
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Create your account</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {verificationPendingEmail ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Verify your email address</h2>
              <p className="text-xs text-neutral-600 mt-1">
                We sent a confirmation link to <span className="font-semibold text-neutral-900">{verificationPendingEmail}</span>.
                Please check your inbox and confirm your address to sign in to Orbit.
              </p>
            </div>
          </div>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full text-xs">
              Go to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Role selection */}
          <div>
            <span className="text-xs font-medium text-neutral-700 block mb-2">Account Type</span>
            <div className="grid grid-cols-1 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.value as "STUDENT" | "FOUNDER");
                    setValue("role", role.value as "STUDENT" | "FOUNDER");
                  }}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    selectedRole === role.value
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                  aria-pressed={selectedRole === role.value}
                >
                  <p className="text-xs font-semibold text-neutral-900">{role.title}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{role.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            required
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3" role="alert">
              <p className="text-xs text-red-700">{serverError}</p>
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create account
          </Button>

          <p className="text-center text-[11px] text-neutral-400 mt-2">
            By creating an account you agree to Orbit&apos;s{" "}
            <Link href="/terms" className="underline hover:text-neutral-600">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-neutral-600">
              Privacy Policy
            </Link>.
          </p>
        </form>
      )}
    </>
  );
}
