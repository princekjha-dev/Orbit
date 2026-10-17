"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users2, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  "AI Builders",
  "Web Development",
  "Entrepreneurship",
  "Design & Product",
  "Hackathons",
  "College Tech",
  "City Tech",
  "Open Source",
];

export default function NewCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          description,
          rules: rules || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create community");
      }

      router.push(`/communities/${data.community.slug}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-6 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Communities
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Users2 className="h-6 w-6 text-brand-600" />
            Create a Community
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Establish a focused space for practitioners to discuss projects, share resources, and coordinate events.
          </p>
        </div>

        <Card className="p-6 bg-white border border-neutral-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Community Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Next.js Architects, Cambridge AI Builders"
                className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Description / Purpose *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what members build, share, and achieve together..."
                className="w-full text-sm border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Community Guidelines & Rules
              </label>
              <textarea
                rows={4}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="1. Keep posts focused on real work and projects.&#10;2. Be constructive in architectural critiques.&#10;3. No spam or self-promotion without substance."
                className="w-full text-sm border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
              <Link href="/communities">
                <Button type="button" variant="outline" size="sm">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !name || !description}
              >
                {submitting ? "Creating..." : "Create Community"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
