"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
    <div className="space-y-6">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73] hover:text-[#1D1D1F] mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          Reset your password.
        </h1>
        <p className="text-[13.5px] text-[#6E6E73] mt-1">
          Enter your email and we will send you a secure verification link.
        </p>
      </div>

      {isSuccess ? (
        <div className="rounded-2xl border border-[#C1EAD0] bg-[#E8F8EE] p-5 space-y-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#1D7F3E] mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-[#1D1D1F]">Reset link sent</h2>
              <p className="text-xs text-[#1D7F3E] mt-1 leading-relaxed">
                If an account exists with that address, you will receive password reset instructions shortly.
              </p>
            </div>
          </div>
          <Link href="/login" className="block pt-2">
            <Button variant="outline" className="w-full text-xs">
              Return to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            Send reset instructions
          </Button>
        </form>
      )}
    </div>
  );
}
