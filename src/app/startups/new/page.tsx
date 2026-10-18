"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rocket, ArrowLeft, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const INDUSTRIES = [
  "Developer Tools",
  "AI & Machine Learning",
  "FinTech",
  "HealthTech",
  "ClimateTech",
  "Web3 & Distributed Systems",
  "EdTech",
  "Enterprise Software",
  "Security & Privacy",
];

const STAGES = [
  { value: "IDEA", label: "Idea Stage — Validating problem & early assumptions" },
  { value: "PROTOTYPE", label: "Prototype — Wireframes or initial Proof-of-Concept ready" },
  { value: "MVP", label: "MVP — Minimum Viable Product built with active test users" },
  { value: "LAUNCHED", label: "Launched — Public product in production" },
  { value: "SCALING", label: "Scaling — Generating revenue & growing customer base" },
];

export default function NewStartupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    problem: "",
    solution: "",
    industry: "Developer Tools",
    stage: "MVP",
    location: "Remote",
    website: "",
    requiredSkills: "Next.js, TypeScript, PostgreSQL",
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim() || !formData.description.trim()) {
        throw new Error("Please provide a startup name and description.");
      }
      if (!formData.problem.trim() || !formData.solution.trim()) {
        throw new Error("Please describe both the problem statement and your solution.");
      }

      const res = await fetch("/api/startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create startup");
      }

      const targetSlug = data.startup?.slug || formData.slug;
      router.push(`/startups/${targetSlug}/workspace`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-neutral-200">
        <Link href="/startups">
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-neutral-600">
            <ArrowLeft className="h-4 w-4" />
            Back to Startups
          </Button>
        </Link>
        <span className="text-neutral-300">|</span>
        <Badge variant="blue" className="text-[11px] font-semibold bg-brand-50 text-brand-700">
          Founder Workspace
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <Rocket className="h-6 w-6 text-brand-600" />
          Launch a New Startup Venture
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Set up your startup workspace, define measurable milestones, publish hiring needs, and recruit verified talent.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-900 text-xs">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission failed</p>
            <p className="mt-0.5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      <Card className="p-6 bg-white border border-neutral-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Startup Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Aether Dynamics"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Workspace URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-lg text-xs text-neutral-500">
                  orbit.app/startups/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="aether-dynamics"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Tagline / Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              One-Line Summary / Mission *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Autonomous workflow orchestration and verifiable cloud pipelines for enterprise teams."
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
            />
          </div>

          {/* Problem & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Problem Statement *
              </label>
              <textarea
                required
                rows={3}
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                placeholder="What critical pain point does your target user face? Why is current tooling inadequate?"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Solution & Technical Angle *
              </label>
              <textarea
                required
                rows={3}
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                placeholder="How does your architecture or workflow solve this? What is your technical advantage?"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900 resize-none"
              />
            </div>
          </div>

          {/* Industry & Stage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Industry Domain *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Development Stage *
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
              >
                {STAGES.map((stg) => (
                  <option key={stg.value} value={stg.value}>
                    {stg.value} — {stg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Location / Work Arrangement
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA (Remote Friendly)"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Website / Demo URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
              />
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Core Tech Stack & Skills Desired
            </label>
            <input
              type="text"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              placeholder="e.g. Next.js, TypeScript, PostgreSQL, Distributed Systems"
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-900"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Used by Scout (Dot #2) to match qualified builders and send team recommendations.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Link href="/startups">
              <Button type="button" variant="outline" size="sm" className="text-xs">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Launch Workspace
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
