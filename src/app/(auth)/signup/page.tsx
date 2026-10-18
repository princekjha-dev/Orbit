"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Mail, Briefcase, Rocket, Search, Compass, ShieldCheck } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";
import { cn } from "@/lib/utils";

const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["TALENT", "FOUNDER", "RECRUITER", "MENTOR", "ORGANIZATION_ADMIN"]),
});

type SignupFormData = z.infer<typeof signupFormSchema>;

const roles = [
  {
    value: "TALENT",
    title: "Talent",
    description: "Build verified work proof, earn credentials, and join top teams.",
    icon: Briefcase,
  },
  {
    value: "FOUNDER",
    title: "Founder",
    description: "Build startup workspaces, post roles, and assemble high-signal teams.",
    icon: Rocket,
  },
  {
    value: "RECRUITER",
    title: "Recruiter",
    description: "Discover candidates scored by real deliverables, not keyword resumes.",
    icon: Search,
  },
  {
    value: "MENTOR",
    title: "Mentor",
    description: "Guide emerging builders and review proof-of-work project milestones.",
    icon: Compass,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("TALENT");
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { role: "TALENT" },
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    setVerificationPendingEmail(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/onboarding`;

      // Map to db role (TALENT -> STUDENT for Prisma schema compatibility)
      const dbRole = data.role === "FOUNDER" ? "FOUNDER" : data.role === "TALENT" ? "STUDENT" : "STUDENT";

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: data.name,
            role: dbRole,
            orbitRole: data.role,
            onboarding_completed: false,
            onboarding_status: "NOT_STARTED",
          },
        },
      });

      if (authError) {
        setServerError(authError.message || "Failed to create account.");
        return;
      }

      // Sync user profile stub to backend database
      try {
        await fetch("/api/auth/init-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: authData.user?.id,
            email: data.email,
            name: data.name,
            role: dbRole,
            orbitRole: data.role,
          }),
        });
      } catch {
        // Fallback silently if profile sync completes on auth callback
      }

      if (authData.session) {
        router.push("/onboarding");
      } else {
        setVerificationPendingEmail(data.email);
      }
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred during signup.");
    }
  };

  if (verificationPendingEmail) {
    return (
      <div className="text-center space-y-4 py-4 animate-fade-in">
        <div className="h-12 w-12 rounded-2xl bg-[#E8F8EE] text-[#1D7F3E] flex items-center justify-center mx-auto">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-[#1D1D1F]">Check your email</h1>
        <p className="text-[13.5px] text-[#6E6E73] leading-relaxed">
          We sent a verification link to <strong className="text-[#1D1D1F]">{verificationPendingEmail}</strong>.
          Click the link in the message to activate your Orbit workspace.
        </p>
        <div className="pt-2">
          <Link href="/login" className="text-xs text-[#0071E3] font-medium hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          Create your Orbit.
        </h1>
        <p className="text-[13.5px] text-[#6E6E73]">
          Start building credible work and verifiable evidence.
        </p>
      </div>

      {/* Google Sign In Option */}
      <div className="space-y-3">
        <GoogleButton mode="signup" callbackUrl="/onboarding" onError={(err) => setServerError(err)} />
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-[#E5E5EA] w-full" />
          <span className="bg-white px-2.5 text-[11px] text-[#86868B] uppercase tracking-wider absolute">
            Or register with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-[12px] font-medium text-[#48484A] mb-1">
            Full name
          </label>
          <input
            type="text"
            required
            placeholder="Ada Lovelace"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-[13.5px] text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
            {...register("name")}
          />
          {errors.name?.message && (
            <p className="text-xs text-[#FF3B30] mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-[12px] font-medium text-[#48484A] mb-1">
            Email address
          </label>
          <input
            type="email"
            required
            placeholder="ada@domain.com"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-[13.5px] text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-xs text-[#FF3B30] mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[12px] font-medium text-[#48484A] mb-1">
            Password (min. 8 characters)
          </label>
          <input
            type="password"
            required
            className="w-full px-3.5 py-2 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-[13.5px] text-[#1D1D1F] focus:border-[#0071E3] focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
            {...register("password")}
          />
          {errors.password?.message && (
            <p className="text-xs text-[#FF3B30] mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[12px] font-medium text-[#48484A]">
            Select your primary role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.value;
              return (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => {
                    setSelectedRole(r.value);
                    setValue("role", r.value as any);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all",
                    isSelected
                      ? "border-[#0071E3] bg-[#0071E3]/[0.06] shadow-2xs"
                      : "border-[#E5E5EA] bg-white hover:border-[#D1D1D6] hover:bg-[#F5F5F7]"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        isSelected ? "text-[#0071E3]" : "text-[#6E6E73]"
                      )}
                    />
                    <span className="text-[12.5px] font-semibold text-[#1D1D1F]">
                      {r.title}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#6E6E73] line-clamp-1 mt-0.5">
                    {r.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {serverError && (
          <div className="rounded-xl bg-[#FDEEEF] border border-[#F9CBD0] px-3.5 py-2.5" role="alert">
            <p className="text-xs text-[#C42B37]">{serverError}</p>
          </div>
        )}

        {/* Terms notice */}
        <p className="text-[11px] text-[#86868B] text-center leading-normal">
          By selecting Continue, you agree to the Orbit{" "}
          <Link href="/terms" className="text-[#0071E3] hover:underline">
            Terms
          </Link>{" "}
          and acknowledge our{" "}
          <Link href="/privacy" className="text-[#0071E3] hover:underline">
            Privacy Policy
          </Link>.
        </p>

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
        Already have an account?{" "}
        <Link href="/login" className="text-[#0071E3] font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
