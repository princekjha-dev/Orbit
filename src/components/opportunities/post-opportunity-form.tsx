"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opportunitySchema } from "@/lib/validation/schemas";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof opportunitySchema>;

interface PostOpportunityFormProps {
  orgId: string;
  orgSlug: string;
}

export function PostOpportunityForm({ orgId, orgSlug }: PostOpportunityFormProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: { workMode: "REMOTE", type: "JOB", skills: [] },
  });

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) { setSkills((p) => [...p, t]); setSkillInput(""); }
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    const target = orgSlug || orgId;
    const res = await fetch(`/api/organizations/${target}/opportunities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, skills }),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error || "Failed to post"); return; }
    router.push(`/opportunities/${result.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Basic details</h2>
        <div className="space-y-4">
          <Input label="Job title" required error={errors.title?.message} {...register("title")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Opportunity type" required error={errors.type?.message} {...register("type")}>
              <option value="JOB">Job</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="PAID_PROJECT">Paid project</option>
              <option value="STARTUP_ROLE">Startup role</option>
            </Select>
            <Select label="Work mode" required {...register("workMode")}>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Location" placeholder="City, Country (or Remote)" {...register("location")} />
            <Input label="Compensation" placeholder="e.g. Paid, market rate / $2000/mo" {...register("compensation")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Duration" placeholder="e.g. 3 months / Full-time" {...register("duration")} />
            <Input label="Application deadline" type="date" {...register("deadline")} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Description</h2>
        <div className="space-y-4">
          <Textarea label="Opportunity description" required rows={6}
            placeholder="Describe the role, responsibilities, what you are building, and why someone should apply."
            error={errors.description?.message} {...register("description")} />
          <Textarea label="Eligibility requirements" rows={3}
            placeholder="Who can apply? Year of study, graduation date, location restrictions, etc."
            {...register("eligibility")} />
          <Textarea label="What to include in the application" rows={3}
            placeholder="Cover letter? Portfolio? GitHub? Specify what you want applicants to send."
            {...register("applicationReqs")} />
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
        <Button type="submit" loading={isSubmitting}>Post opportunity</Button>
      </div>
    </form>
  );
}
