"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Lock,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function PortfolioBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("Failed to load portfolio");
        const data = await res.json();
        if (data.portfolio) {
          setSlug(data.portfolio.slug || "");
          setTitle(data.portfolio.title || "");
          setBio(data.portfolio.bio || "");
          setIsPublic(data.portfolio.isPublic ?? true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          title: title.trim(),
          bio: bio.trim(),
          isPublic,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save portfolio");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-neutral-500 text-sm">
        Loading portfolio configuration...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Profile</span>
          </Link>
          {slug && (
            <Link
              href={`/p/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
            >
              <span>View Public Page</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Portfolio Builder
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Turn your real Orbit project outcomes, skills, and verified work records into a clean public evidence portfolio.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>Portfolio settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-white border-neutral-200 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">
                Portfolio URL Slug
              </label>
              <div className="flex items-center rounded-md border border-neutral-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 bg-white">
                <span className="pl-3 pr-1 text-sm text-neutral-400 select-none">
                  orbit.work/p/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                  placeholder="username"
                  required
                  className="w-full px-2 py-2 text-sm text-neutral-900 focus:outline-none rounded-r-md"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                This will be your shareable evidence link for recruiters, founders, and teams.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">
                Portfolio Headline / Title
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full-Stack Engineer & Systems Builder"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1">
                Executive Bio / Focus
              </label>
              <Textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your primary technical focus, specialties, and the kind of problems you enjoy solving."
              />
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Visibility
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                    isPublic
                      ? "border-brand-600 bg-brand-50/50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-brand-600" />
                    <span className="text-sm font-medium text-neutral-900">Public</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Accessible to anyone with your link.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                    !isPublic
                      ? "border-brand-600 bg-brand-50/50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-900">Private</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Only accessible when logged into your account.
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Portfolio"}
              </Button>
            </div>
          </Card>
        </form>

        {/* Provenance Explainer */}
        <Card className="p-5 bg-neutral-100 border-neutral-200 text-xs text-neutral-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-neutral-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Automatic Orbit Evidence Aggregation</span>
          </div>
          <p>
            Your portfolio does not use unverified resume claims or fake ratings. It automatically extracts your verified work records, completed projects, GitHub artifacts, and verified certifications directly from your Orbit history.
          </p>
        </Card>
      </div>
    </div>
  );
}
