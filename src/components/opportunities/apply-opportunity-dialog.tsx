"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { applyOpportunitySchema } from "@/lib/validation/schemas";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type ApplyFormData = z.infer<typeof applyOpportunitySchema>;

interface ApplyOpportunityDialogProps {
  opportunityId: string;
}

export function ApplyOpportunityDialog({ opportunityId }: ApplyOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applyOpportunitySchema),
  });

  const onSubmit = async (data: ApplyFormData) => {
    setServerError("");
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || "Failed to submit application");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 1500);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Apply for this role
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Apply for this opportunity"
        description="Your profile information will be shared with the organization."
      >
        {success ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-900">Application submitted</p>
            <p className="text-xs text-neutral-500 mt-1">You can track status in My applications</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Textarea
              label="Cover letter"
              required
              placeholder="Explain why you are a good fit for this role. Be specific about your relevant experience and what you would bring."
              rows={6}
              error={errors.coverLetter?.message}
              {...register("coverLetter")}
            />
            <Input
              label="Portfolio or work sample URL (optional)"
              type="url"
              placeholder="https://..."
              error={errors.portfolioUrl?.message}
              {...register("portfolioUrl")}
            />

            {serverError && (
              <p className="text-sm text-danger-500" role="alert">{serverError}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Submit application
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
