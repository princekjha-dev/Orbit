"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [serverError, setServerError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          <p className="text-sm text-green-700 font-medium">Account created. Sign in to continue.</p>
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
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <div className="rounded-lg bg-danger-50 border border-red-100 px-4 py-3" role="alert">
            <p className="text-sm text-danger-500">{serverError}</p>
          </div>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-neutral-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
