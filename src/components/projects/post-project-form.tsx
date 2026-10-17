"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validation/schemas";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof projectSchema>;

export function PostProjectForm({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { skills: [] },
  });

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) { setSkills((p) => [...p, t]); setSkillInput(""); }
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch(`/api/organizations/${orgId}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, skills }),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Failed"); return; }
    router.push(`/projects/${result.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Project details</h2>
        <div className="space-y-4">
          <Input label="Project title" required error={errors.title?.message} {...register("title")} />
          <Textarea label="Problem statement" required rows={4}
            hint="What problem does this project solve? Be specific."
            error={errors.problem?.message} {...register("problem")} />
          <Textarea label="Scope of work" required rows={4}
            hint="Clearly define what the contributor will do. Be precise about boundaries."
            error={errors.scope?.message} {...register("scope")} />
          <Textarea label="Expected deliverable" required rows={3}
            hint="What will the contributor hand over when done? (code, document, design, etc.)"
            error={errors.deliverable?.message} {...register("deliverable")} />
          <Textarea label="Acceptance criteria" rows={3}
            hint="How will you determine the deliverable meets requirements?"
            {...register("acceptanceCriteria")} />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Terms</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Estimated hours" type="number" min={1}
              hint="Approximate total work hours"
              error={errors.expectedHours?.message}
              {...register("expectedHours", { valueAsNumber: true })} />
            <Input label="Application deadline" type="date" {...register("deadline")} />
          </div>
          <Input label="Payment" required
            placeholder="e.g. $500 fixed / $25/hr / Negotiable"
            hint="Orbit requires all projects to be paid."
            {...register("payment")} />
          <Textarea label="IP / ownership terms" rows={2}
            placeholder="Who owns the work product? E.g. all IP transfers to organization, contributor retains rights to publish etc."
            {...register("ipTerms")} />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Required skills</h2>
        <div className="flex gap-2 mb-3">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            placeholder="Add a skill..." aria-label="Add required skill"
            className="flex-1 border border-neutral-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <Button type="button" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" aria-hidden="true" /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
              {s}
              <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      </Card>

      {error && <p className="text-sm text-danger-500" role="alert">{error}</p>}

      <div className="flex gap-2">
        <Link href={`/org/${orgSlug}`}><Button type="button" variant="outline">Cancel</Button></Link>
        <Button type="submit" loading={isSubmitting}>Post project</Button>
      </div>
    </form>
  );
}
