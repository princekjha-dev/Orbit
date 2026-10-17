"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupSchema } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SignupFormData = z.infer<typeof signupSchema>;

const roles = [
  {
    value: "STUDENT",
    title: "Student / Job Seeker",
    description: "Find opportunities, complete projects, build a track record",
  },
  {
    value: "FOUNDER",
    title: "Founder / Organization",
    description: "Post opportunities, run projects, build a verified team",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "FOUNDER">("STUDENT");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "STUDENT" },
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || "Something went wrong");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setServerError("Network error. Please try again.");
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

      {/* Role selection */}
      <div className="mb-6">
        <p className="text-sm font-medium text-neutral-700 mb-2">I am a</p>
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
                  ? "border-brand-500 bg-brand-50"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
              aria-pressed={selectedRole === role.value}
            >
              <p className={`text-sm font-medium ${selectedRole === role.value ? "text-brand-700" : "text-neutral-900"}`}>
                {role.title}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{role.description}</p>
            </button>
          ))}
        </div>
        {errors.role && (
          <p className="mt-1.5 text-xs text-danger-500">{errors.role.message}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          hint="At least 8 characters, one uppercase, one number"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <div className="rounded-lg bg-danger-50 border border-red-100 px-4 py-3" role="alert">
            <p className="text-sm text-danger-500">{serverError}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
        >
          Create account
        </Button>

        <p className="text-xs text-neutral-500 text-center">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-brand-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </>
  );
}
