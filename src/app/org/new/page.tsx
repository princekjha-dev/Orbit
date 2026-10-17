"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizationSchema } from "@/lib/validation/schemas";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type FormData = z.infer<typeof organizationSchema>;

export default function NewOrgPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(organizationSchema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Failed to create"); return; }
    router.push(`/org/${result.slug}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Create organization</h1>
        <p className="text-neutral-500 text-sm mt-1">
          After creating, you can apply for verification to get the Verified badge on your listings.
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Organization name" required error={errors.name?.message} {...register("name")} />
          <Textarea label="Description" required rows={4}
            hint="Describe what your organization does, who you are, and what you are working on."
            error={errors.description?.message} {...register("description")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Industry" placeholder="e.g. EdTech, Fintech, SaaS" {...register("industry")} />
            <Input label="Location" placeholder="City, Country" {...register("location")} />
          </div>
          <Input label="Website" type="url" placeholder="https://..." error={errors.website?.message} {...register("website")} />
          <Input label="Contact email" type="email" error={errors.email?.message} {...register("email")} />
          {error && <p className="text-sm text-danger-500" role="alert">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Link href="/dashboard"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" loading={isSubmitting}>Create organization</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
