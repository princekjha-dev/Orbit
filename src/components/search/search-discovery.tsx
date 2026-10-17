"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Search,
  Users2,
  Briefcase,
  FolderKanban,
  Rocket,
  Compass,
  Lightbulb,
  Calendar,
  Bookmark,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SearchResults {
  people: any[];
  opportunities: any[];
  projects: any[];
  startups: any[];
  communities: any[];
  ideas: any[];
  events: any[];
}

const CATEGORY_TABS = [
  { id: "ALL", label: "All Results", icon: Search },
  { id: "PEOPLE", label: "People", icon: Users2 },
  { id: "OPPORTUNITIES", label: "Opportunities", icon: Briefcase },
  { id: "PROJECTS", label: "Projects", icon: FolderKanban },
  { id: "STARTUPS", label: "Startups", icon: Rocket },
  { id: "COMMUNITIES", label: "Communities", icon: Users2 },
  { id: "IDEAS", label: "Ideas", icon: Lightbulb },
  { id: "EVENTS", label: "Events", icon: Calendar },
];

export function SearchDiscovery({ initialQuery = "", currentUserId }: { initialQuery?: string; currentUserId?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [results, setResults] = useState<SearchResults>({
    people: [],
    opportunities: [],
    projects: [],
    startups: [],
    communities: [],
    ideas: [],
    events: [],
  });
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchSavedSearches = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/search/saved");
      if (res.ok) {
        const d = await res.json();
        setSavedSearches(d.searches || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  const executeSearch = useCallback(async (searchQuery: string, cat: string) => {
    if (!searchQuery.trim()) {
      setResults({
        people: [],
        opportunities: [],
        projects: [],
        startups: [],
        communities: [],
        ideas: [],
        events: [],
      });
      setCounts({});
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        category: cat,
      });
      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setResults(d.results);
        setCounts(d.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery, activeCategory);
    }
  }, [initialQuery, activeCategory, executeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, activeCategory);
  };

  const handleSaveSearch = async () => {
    if (!query || !currentUserId) return;
    try {
      const res = await fetch("/api/search/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category: activeCategory }),
      });
      if (res.ok) {
        await fetchSavedSearches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalResults = counts.all || 0;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-brand-600" />
          Unified Ecosystem Discovery
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Explore people, startups, ideas, opportunities, projects, and communities across the Orbit ecosystem.
        </p>
      </div>

      {/* Search Bar & Save */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, skills, roles, problem spaces, technologies..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
        <Button type="submit" variant="primary" size="md">
          Search
        </Button>
        {currentUserId && query && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleSaveSearch}
            className="text-xs gap-1.5"
            title="Save this search"
          >
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
        )}
      </form>

      {/* Saved Searches Chips */}
      {savedSearches.length > 0 && !hasSearched && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-neutral-500">Saved Searches:</span>
          {savedSearches.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setQuery(s.query);
                setActiveCategory(s.category);
                executeSearch(s.query, s.category);
              }}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors cursor-pointer"
            >
              {s.query}
            </button>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200">
        {CATEGORY_TABS.map((tab) => {
          const count =
            tab.id === "ALL" ? counts.all : counts[tab.id.toLowerCase()];
          const isActive = activeCategory === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                executeSearch(query, tab.id);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-brand-600 text-brand-700 font-semibold"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <span>{tab.label}</span>
              {count !== undefined && count > 0 && (
                <span className="px-1.5 py-0.2 bg-neutral-100 rounded-full text-[10px] text-neutral-600 font-semibold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results View */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 bg-white border border-neutral-200 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded-sm w-1/3 mb-2" />
              <div className="h-3 bg-neutral-100 rounded-sm w-2/3" />
            </Card>
          ))}
        </div>
      ) : hasSearched && totalResults === 0 ? (
        <EmptyState
          title="No results found"
          description={`No ecosystem records matched "${query}". Try searching broader keywords or different skill tags.`}
          className="py-12 bg-white rounded-xl border border-neutral-200"
        />
      ) : (
        <div className="space-y-8">
          {/* People Section */}
          {(activeCategory === "ALL" || activeCategory === "PEOPLE") && results.people.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users2 className="h-4 w-4 text-brand-600" />
                  People ({results.people.length})
                </h2>
                <Link href="/people" className="text-xs text-brand-600 hover:underline">
                  People directory &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.people.map((p) => (
                  <Card key={p.id} className="p-3.5 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <Avatar src={p.image} name={p.name} size="md" />
                      <div className="min-w-0">
                        <Link href={`/u/${p.username}`} className="font-bold text-neutral-900 text-xs hover:underline block truncate">
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-neutral-400 truncate">@{p.username}</p>
                        {p.headline && <p className="text-xs text-neutral-600 mt-1 line-clamp-1">{p.headline}</p>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Section */}
          {(activeCategory === "ALL" || activeCategory === "OPPORTUNITIES") && results.opportunities.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-brand-600" />
                  Opportunities ({results.opportunities.length})
                </h2>
                <Link href="/opportunities" className="text-xs text-brand-600 hover:underline">
                  Browse opportunities &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.opportunities.map((opp) => (
                  <Card key={opp.id} className="p-4 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link href={`/opportunities/${opp.id}`} className="font-bold text-sm text-neutral-900 hover:text-brand-600">
                          {opp.title}
                        </Link>
                        <p className="text-xs text-neutral-500 mt-0.5">Org: {opp.orgName}</p>
                      </div>
                      <Badge variant="blue" className="text-[10px]">{opp.type}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Startups Section */}
          {(activeCategory === "ALL" || activeCategory === "STARTUPS") && results.startups.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Rocket className="h-4 w-4 text-brand-600" />
                  Startups ({results.startups.length})
                </h2>
                <Link href="/startups" className="text-xs text-brand-600 hover:underline">
                  Startup hub &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.startups.map((st) => (
                  <Card key={st.id} className="p-4 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Link href={`/startups/${st.slug}`} className="font-bold text-sm text-neutral-900 hover:text-brand-600 truncate">
                        {st.name}
                      </Link>
                      <Badge variant="neutral" className="text-[10px]">{st.stage}</Badge>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1">{st.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Communities Section */}
          {(activeCategory === "ALL" || activeCategory === "COMMUNITIES") && results.communities.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users2 className="h-4 w-4 text-brand-600" />
                  Communities ({results.communities.length})
                </h2>
                <Link href="/communities" className="text-xs text-brand-600 hover:underline">
                  All communities &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.communities.map((cm) => (
                  <Card key={cm.id} className="p-4 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <Badge variant="blue" className="text-[10px] mb-2">{cm.category}</Badge>
                    <Link href={`/communities/${cm.slug}`} className="font-bold text-sm text-neutral-900 hover:text-brand-600 block">
                      {cm.name}
                    </Link>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1">{cm.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ideas Section */}
          {(activeCategory === "ALL" || activeCategory === "IDEAS") && results.ideas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-brand-600" />
                  Ideas ({results.ideas.length})
                </h2>
                <Link href="/ideas" className="text-xs text-brand-600 hover:underline">
                  Ideas workspace &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.ideas.map((id) => (
                  <Card key={id.id} className="p-4 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <Link href={`/ideas/${id.id}`} className="font-bold text-sm text-neutral-900 hover:text-brand-600">
                      {id.title}
                    </Link>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1">{id.problem}</p>
                    <p className="text-[11px] text-neutral-400 mt-2">By {id.creatorName} · {id.industry}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
