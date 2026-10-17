"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/validation/schemas";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

type FormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  userId: string;
  userName: string;
  userEmail: string;
  profile: any;
}

export function ProfileEditForm({ userId, userName, userEmail, profile }: ProfileEditFormProps) {
  const [skills, setSkills] = useState<string[]>(
    profile?.skills?.map((s: any) => s.skill.name) || []
  );
  const [skillInput, setSkillInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: profile?.headline || "",
      about: profile?.about || "",
      location: profile?.location || "",
      college: profile?.college || "",
      company: profile?.company || "",
      website: profile?.website || "",
      github: profile?.github || "",
      linkedin: profile?.linkedin || "",
      portfolio: profile?.portfolio || "",
      skills: skills,
    },
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 30) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, skills }),
    });
    const result = await res.json();
    if (!res.ok) { setServerError(result.error || "Failed to save"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <Card>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Basic information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full name" value={userName} disabled hint="Change via account settings" />
            <Input label="Email" value={userEmail} disabled />
          </div>
          <Input label="Headline" placeholder="e.g. Final-year CS student | React developer"
            error={errors.headline?.message} {...register("headline")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Location" placeholder="City, Country" {...register("location")} />
            <Input label="College" placeholder="University name" {...register("college")} />
          </div>
          <Input label="Current company (if any)" {...register("company")} />
          <Textarea label="About" rows={4}
            placeholder="Describe your background, what you are working on, and what you are looking for."
            error={errors.about?.message} {...register("about")} />
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Skills</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            placeholder="Add a skill and press Enter"
            className="flex-1 border border-neutral-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Add skill"
          />
          <Button type="button" variant="outline" onClick={addSkill}>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
        {skills.length === 0 && <p className="text-xs text-neutral-400">No skills added yet.</p>}
      </Card>

      {/* Links */}
      <Card>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Links</h2>
        <div className="space-y-4">
          <Input label="GitHub" type="url" placeholder="https://github.com/username"
            error={errors.github?.message} {...register("github")} />
          <Input label="LinkedIn" type="url" placeholder="https://linkedin.com/in/username"
            error={errors.linkedin?.message} {...register("linkedin")} />
          <Input label="Portfolio" type="url" placeholder="https://..."
            error={errors.portfolio?.message} {...register("portfolio")} />
          <Input label="Website" type="url" placeholder="https://..."
            error={errors.website?.message} {...register("website")} />
        </div>
      </Card>

      {serverError && (
        <div className="rounded-lg bg-danger-50 border border-red-100 px-4 py-3" role="alert">
          <p className="text-sm text-danger-500">{serverError}</p>
        </div>
      )}

      {saved && (
        <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3" role="status">
          <p className="text-sm text-green-700 font-medium">Profile saved.</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>Save profile</Button>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </form>
  );
}
