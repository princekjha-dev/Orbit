"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users2,
  Plus,
  Search,
  Clock,
  Calendar,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Briefcase,
  HelpCircle,
} from "lucide-react";

interface CollabPost {
  id: string;
  postType: "OFFERING_HELP" | "SEEKING_HELP";
  skills: string;
  context: string;
  expectedContribution: string;
  availability: string;
  duration: string;
  compensationType: "PAID" | "EQUITY" | "VOLUNTEER" | "OPEN_TO_DISCUSSION";
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    headline?: string | null;
    location?: string | null;
    verifiedWorkCount: number;
  };
}

export default function CollaborationsPage() {
  const [posts, setPosts] = useState<CollabPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [postTypeFilter, setPostTypeFilter] = useState<string>("ALL");
  const [compFilter, setCompFilter] = useState<string>("ALL");
  const [skillSearch, setSkillSearch] = useState<string>("");

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [postType, setPostType] = useState<"OFFERING_HELP" | "SEEKING_HELP">("OFFERING_HELP");
  const [skills, setSkills] = useState("");
  const [context, setContext] = useState("");
  const [expectedContribution, setExpectedContribution] = useState("");
  const [availability, setAvailability] = useState("10 hrs/week");
  const [duration, setDuration] = useState("2 months");
  const [compensationType, setCompensationType] = useState<"PAID" | "EQUITY" | "VOLUNTEER" | "OPEN_TO_DISCUSSION">("PAID");

  useEffect(() => {
    loadPosts();
  }, [postTypeFilter, compFilter]);

  async function loadPosts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (postTypeFilter !== "ALL") params.set("postType", postTypeFilter);
      if (compFilter !== "ALL") params.set("compensationType", compFilter);
      if (skillSearch) params.set("skill", skillSearch);

      const res = await fetch(`/api/collaborations/market?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load collaboration posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/collaborations/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postType,
          skills,
          context,
          expectedContribution,
          availability,
          duration,
          compensationType,
        }),
      });

      if (!res.ok) throw new Error("Failed to publish collaboration post");
      setShowModal(false);
      setSkills("");
      setContext("");
      setExpectedContribution("");
      loadPosts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const compensationBadge = (type: string) => {
    switch (type) {
      case "PAID":
        return <Badge variant="green">Paid Work</Badge>;
      case "EQUITY":
        return <Badge variant="blue">Equity Grant</Badge>;
      case "VOLUNTEER":
        return <Badge variant="amber">Volunteer</Badge>;
      default:
        return <Badge variant="neutral">Open to Discussion</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Users2 className="h-6 w-6 text-neutral-800" />
              Collaboration Market
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Structured collaboration discovery. No hidden compensation, no exploitative terms.
            </p>
          </div>

          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Publish Request
          </Button>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 bg-white border-neutral-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadPosts()}
                placeholder="Filter by skills (e.g. React, UI Design, Marketing, Rust)..."
                className="text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={postTypeFilter}
                onChange={(e) => setPostTypeFilter(e.target.value)}
                className="text-xs rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="ALL">All Posts</option>
                <option value="OFFERING_HELP">I can help with... (Offerings)</option>
                <option value="SEEKING_HELP">I am looking for... (Needs)</option>
              </select>

              <select
                value={compFilter}
                onChange={(e) => setCompFilter(e.target.value)}
                className="text-xs rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="ALL">All Compensation</option>
                <option value="PAID">Paid Only</option>
                <option value="EQUITY">Equity</option>
                <option value="VOLUNTEER">Volunteer</option>
                <option value="OPEN_TO_DISCUSSION">Open to Discussion</option>
              </select>

              <Button size="sm" variant="outline" onClick={loadPosts}>
                <Search className="h-3.5 w-3.5 mr-1" />
                Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Post Grid */}
        {loading ? (
          <div className="text-center py-12 text-xs text-neutral-500">
            Loading collaboration market...
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center bg-white border-neutral-200">
            <Users2 className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
            <h2 className="text-base font-semibold text-neutral-900">
              No collaboration posts found
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Be the first to publish what you can help with or what partner you are looking for.
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Publish First Post
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="p-5 bg-white border-neutral-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Top line: Type & Compensation */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={post.postType === "OFFERING_HELP" ? "blue" : "purple"}>
                      {post.postType === "OFFERING_HELP" ? "Offering Help" : "Seeking Collaborator"}
                    </Badge>
                    {compensationBadge(post.compensationType)}
                  </div>

                  {/* Skills Headline */}
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      {post.skills}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">
                      {post.context}
                    </p>
                  </div>

                  {/* Expected Contribution */}
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-700">
                    <span className="font-semibold text-neutral-900 block mb-0.5">
                      Expected Contribution:
                    </span>
                    {post.expectedContribution}
                  </div>

                  {/* Availability & Duration chips */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.availability}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {post.duration}
                    </span>
                  </div>
                </div>

                {/* Footer: Author & Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {post.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">
                        {post.user.name}
                      </p>
                      <Link
                        href={`/p/${post.user.username}`}
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-0.5"
                      >
                        @{post.user.username}
                        {post.user.verifiedWorkCount > 0 && (
                          <ShieldCheck className="h-3 w-3 text-emerald-600 ml-0.5" />
                        )}
                      </Link>
                    </div>
                  </div>

                  <Link href={`/messages`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      Connect
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Publish Collaboration Post */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-6 bg-white border-neutral-200 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-neutral-900">
                Publish Structured Collaboration
              </h2>
              <p className="text-xs text-neutral-500">
                Clearly state your skill, expected contribution, and terms.
              </p>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    What are you publishing?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPostType("OFFERING_HELP")}
                      className={`p-2.5 rounded-lg border text-center transition-colors font-medium ${
                        postType === "OFFERING_HELP"
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      I can help with...
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostType("SEEKING_HELP")}
                      className={`p-2.5 rounded-lg border text-center transition-colors font-medium ${
                        postType === "SEEKING_HELP"
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      I am looking for...
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Skills / Specialty
                  </label>
                  <Input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Next.js & TypeScript, UI/UX Design, Growth Marketing"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Context / Project Background
                  </label>
                  <Input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. Building an open-source analytics tool for healthcare"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Expected Contribution
                  </label>
                  <Textarea
                    rows={3}
                    value={expectedContribution}
                    onChange={(e) => setExpectedContribution(e.target.value)}
                    placeholder="Describe concrete deliverables or areas of responsibility..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">
                      Availability
                    </label>
                    <Input
                      type="text"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder="e.g. 10 hrs/week, Evenings"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">
                      Duration
                    </label>
                    <Input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 1 month, 3 months"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Compensation Type
                  </label>
                  <select
                    value={compensationType}
                    onChange={(e) => setCompensationType(e.target.value as any)}
                    className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="PAID">Paid</option>
                    <option value="EQUITY">Equity</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="OPEN_TO_DISCUSSION">Open to discussion</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? "Publishing..." : "Publish Request"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
