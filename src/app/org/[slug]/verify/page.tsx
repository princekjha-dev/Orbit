"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

export default function VerifyOrgPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{
    notes: string;
    evidenceUrl: string;
  }>();

  const onSubmit = async (data: any) => {
    const res = await fetch(`/api/org/${params.slug}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Failed to submit"); return; }
    setSuccess(true);
    setTimeout(() => router.push(`/org/${params.slug}/manage`), 2000);
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Link href={`/org/${params.slug}/manage`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to manage
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-green-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Apply for verification</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Our team will review your application within 3–5 business days.</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h2 className="text-sm font-medium text-blue-800 mb-2">What verification requires</h2>
          <ul className="text-sm text-blue-700 space-y-1.5">
            <li>• A working website or LinkedIn page for your organization</li>
            <li>• Evidence of incorporation or official existence (if applicable)</li>
            <li>• A verifiable contact email on your organization's domain</li>
            <li>• At least one real listing with accurate details</li>
          </ul>
        </div>

        {success ? (
          <Card className="text-center py-8">
            <ShieldCheck className="h-8 w-8 text-green-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-neutral-900">Verification request submitted</p>
            <p className="text-xs text-neutral-500 mt-1">We will review it within 3–5 business days.</p>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Evidence URL" type="url"
                placeholder="Link to your website, LinkedIn, or registration document"
                {...register("evidenceUrl")} />
              <Textarea label="Notes for reviewers" rows={4}
                placeholder="Tell us about your organization. Include any context that will help us verify your legitimacy."
                {...register("notes")} />
              {error && <p className="text-sm text-danger-500" role="alert">{error}</p>}
              <Button type="submit" loading={isSubmitting} className="w-full">
                Submit verification request
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
