"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError("");
    setIsSuccess(false);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/settings`;

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err?.message || "Failed to process request. Please try again.");
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
        <h1 className="text-xl font-bold text-neutral-900">Reset your password</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Enter your registered email address and we will send you a secure password reset link.
        </p>
      </div>

      {isSuccess ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Reset link sent</h2>
              <p className="text-xs text-neutral-600 mt-1">
                If an account exists with that email address, you will receive password reset instructions shortly.
              </p>
            </div>
          </div>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full text-xs">
              Return to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3" role="alert">
              <p className="text-xs text-red-700">{serverError}</p>
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send reset instructions
          </Button>
        </form>
      )}
    </>
  );
}
