"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTeamPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{
    name: string;
    description: string;
    projectIdea: string;
    rolesNeeded: string;
    githubUrl: string;
  }>();

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/hackathons/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Failed to create team"); return; }
    router.push(`/hackathons/${result.id}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <Link href="/hackathons" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to teams
      </Link>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Create a team</h1>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Team name" required {...register("name")} />
          <Textarea label="Description" rows={3} placeholder="What is your team about?" {...register("description")} />
          <Textarea label="Project idea" rows={3} placeholder="What do you want to build?" {...register("projectIdea")} />
          <Input label="Roles needed" placeholder="e.g. Frontend dev, UI designer, ML engineer" {...register("rolesNeeded")} />
          <Input label="GitHub URL (optional)" type="url" {...register("githubUrl")} />
          {error && <p className="text-sm text-danger-500" role="alert">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Link href="/hackathons"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" loading={isSubmitting}>Create team</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
