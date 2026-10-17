"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { projectApplicationSchema } from "@/lib/validation/schemas";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof projectApplicationSchema>;

export function ProjectApplyDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(projectApplicationSchema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const res = await fetch(`/api/projects/${projectId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) { setServerError(result.error || "Failed to submit"); return; }
    setSuccess(true);
    setTimeout(() => { setOpen(false); router.refresh(); }, 1500);
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>Apply for this project</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Apply for this project"
        description="Write a focused proposal explaining your approach and relevant work.">
        {success ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-900">Proposal submitted</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Textarea label="Proposal" required rows={5}
              placeholder="Describe your approach to this project. What makes you a good fit? What similar work have you done?"
              error={errors.proposal?.message} {...register("proposal")} />
            <Input label="Work samples or portfolio URL (optional)" type="url" placeholder="https://..."
              error={errors.workSamples?.message} {...register("workSamples")} />
            <Input label="Availability" placeholder="e.g. 20 hrs/week starting Nov 1"
              error={errors.availability?.message} {...register("availability")} />
            {serverError && <p className="text-sm text-danger-500" role="alert">{serverError}</p>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={isSubmitting}>Submit proposal</Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
