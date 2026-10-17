"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

interface PageProps { params: { id: string } }

export default function HackathonSubmitPage({ params }: PageProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{
    title: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    devpostUrl: string;
  }>();

  const onSubmit = async (data: any) => {
    const res = await fetch(`/api/hackathons/teams/${params.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Failed to submit"); return; }
    setSuccess(true);
    setTimeout(() => router.push(`/hackathons/${params.id}`), 2000);
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Link href={`/hackathons/${params.id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to team
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Submit project</h1>

        {success ? (
          <Card className="text-center py-10">
            <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-base font-semibold text-neutral-900">Submission received</p>
            <p className="text-sm text-neutral-500 mt-1">Good luck!</p>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input label="Project name" required {...register("title", { required: true })} />
              <Textarea label="Description" required rows={4}
                placeholder="Describe what you built and how it works."
                {...register("description", { required: true })} />
              <Input label="GitHub repository" type="url" placeholder="https://github.com/..."
                {...register("githubUrl")} />
              <Input label="Live demo URL" type="url" placeholder="https://..."
                {...register("demoUrl")} />
              <Input label="Devpost link (if applicable)" type="url" placeholder="https://devpost.com/..."
                {...register("devpostUrl")} />
              {error && <p className="text-sm text-danger-500" role="alert">{error}</p>}
              <Button type="submit" loading={isSubmitting} className="w-full">Submit project</Button>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
