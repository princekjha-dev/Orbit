"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Users2,
  Plus,
  Search,
  MessageSquare,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isMember: boolean;
  currentUserRole?: string | null;
  creator: { id: string; name: string; username: string };
}

const CATEGORIES = [
  "All",
  "AI Builders",
  "Web Development",
  "Entrepreneurship",
  "Design & Product",
  "Hackathons",
  "College Tech",
  "City Tech",
];

export function CommunitiesExplorer({ currentUserId }: { currentUserId?: string }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory !== "All") params.set("category", selectedCategory);

      const res = await fetch(`/api/communities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.communities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleToggleJoin = async (slug: string, currentlyMember: boolean) => {
    if (!currentUserId) return;
    setJoiningSlug(slug);

    try {
      const res = await fetch(`/api/communities/${slug}/members`, {
        method: currentlyMember ? "DELETE" : "POST",
      });
      if (res.ok) {
        await fetchCommunities();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningSlug(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Users2 className="h-6 w-6 text-brand-600" />
            Communities
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Topic-focused hubs for builders, founders, and specialists to exchange knowledge and collaborate.
          </p>
        </div>

        {currentUserId && (
          <Link href="/communities/new">
            <Button size="sm" variant="primary" className="text-xs gap-1.5">
              <Plus className="h-4 w-4" />
              Create Community
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities by name or topic..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-neutral-900 text-white font-semibold"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-5 animate-pulse bg-white border border-neutral-200">
              <div className="h-5 bg-neutral-200 rounded-sm w-1/2 mb-2" />
              <div className="h-3 bg-neutral-100 rounded-sm w-3/4 mb-4" />
              <div className="h-8 bg-neutral-100 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : communities.length === 0 ? (
        <EmptyState
          title="No communities found"
          description="Try adjusting your search criteria or create a new community for your focus area."
          action={
            currentUserId ? (
              <Link href="/communities/new">
                <Button size="sm">Create a Community</Button>
              </Link>
            ) : undefined
          }
          className="py-12 bg-white rounded-xl border border-neutral-200"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {communities.map((comm) => (
            <Card
              key={comm.id}
              className="p-5 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge variant="neutral" className="text-[10px]">
                    {comm.category}
                  </Badge>
                  {comm.isMember && (
                    <Badge variant="green" className="text-[10px]">
                      {comm.currentUserRole === "ADMIN" ? "Admin" : "Joined"}
                    </Badge>
                  )}
                </div>

                <Link
                  href={`/communities/${comm.slug}`}
                  className="text-base font-bold text-neutral-900 hover:text-brand-600 block line-clamp-1"
                >
                  {comm.name}
                </Link>

                <p className="text-xs text-neutral-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {comm.description}
                </p>

                <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Users2 className="h-3.5 w-3.5 text-neutral-400" />
                    {comm.memberCount} member{comm.memberCount !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
                    {comm.postCount} post{comm.postCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                <Link
                  href={`/communities/${comm.slug}`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Open Hub
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                {currentUserId && (
                  <Button
                    size="sm"
                    variant={comm.isMember ? "outline" : "primary"}
                    disabled={joiningSlug === comm.slug}
                    onClick={() => handleToggleJoin(comm.slug, comm.isMember)}
                    className="text-xs"
                  >
                    {comm.isMember ? "Joined" : "Join"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
