"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Briefcase,
  FolderKanban,
  Calendar,
  Trophy,
  Users2,
  Rocket,
  ArrowRight,
  X,
  Filter,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { CategoryNavigation, CategoryItem } from "@/components/ui/category-navigation";
import {
  OpportunityCard,
  ProjectCard,
  EventCard,
  HackathonCard,
  CommunityCard,
  StartupCard,
} from "@/components/ui/orbit-cards";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { formatDate } from "@/lib/utils";

interface DiscoverCounts {
  all: number;
  people: number;
  startups: number;
  projects: number;
  opportunities: number;
  events: number;
  hackathons: number;
  communities: number;
}

interface DiscoverViewProps {
  initialOpportunities: any[];
  initialProjects: any[];
  initialEvents: any[];
  initialHackathons?: any[];
  initialStartups?: any[];
  initialCommunities: any[];
  initialUsers: any[];
  initialCounts: DiscoverCounts;
}

export function DiscoverView({
  initialOpportunities,
  initialProjects,
  initialEvents,
  initialHackathons = [],
  initialStartups = [],
  initialCommunities,
  initialUsers,
  initialCounts,
}: DiscoverViewProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Filters
  const [workModeFilter, setWorkModeFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [formatFilter, setFormatFilter] = useState("ALL");

  // Search Results state
  const [searchResults, setSearchResults] = useState<any | null>(null);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 280);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute Backend Search when query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    let isCancelled = false;
    setIsSearching(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&category=ALL`)
      .then((res) => res.json())
      .then((json) => {
        if (!isCancelled && json.success && json.results) {
          setSearchResults(json.results);
        }
      })
      .catch(() => {
        if (!isCancelled) setSearchResults(null);
      })
      .finally(() => {
        if (!isCancelled) setIsSearching(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  // Source arrays depending on search query
  const opportunities = useMemo(() => {
    if (searchResults?.opportunities) {
      return searchResults.opportunities;
    }
    return initialOpportunities.filter((o) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        o.title?.toLowerCase().includes(q) ||
        o.organization?.name?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q)
      );
    });
  }, [searchResults, initialOpportunities, debouncedQuery]);

  const projects = useMemo(() => {
    if (searchResults?.projects) {
      return searchResults.projects;
    }
    return initialProjects.filter((p) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.scope?.toLowerCase().includes(q)
      );
    });
  }, [searchResults, initialProjects, debouncedQuery]);

  const events = useMemo(() => {
    if (searchResults?.events) {
      return searchResults.events.filter((e: any) => e.type !== "HACKATHON");
    }
    return initialEvents.filter((e) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.organizerName?.toLowerCase().includes(q)
      );
    });
  }, [searchResults, initialEvents, debouncedQuery]);

  const hackathons = useMemo(() => {
    if (searchResults?.events) {
      return searchResults.events.filter((e: any) => e.type === "HACKATHON");
    }
    return initialHackathons.filter((h) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        h.title?.toLowerCase().includes(q) ||
        h.description?.toLowerCase().includes(q) ||
        h.organizerName?.toLowerCase().includes(q)
      );
    });
  }, [searchResults, initialHackathons, debouncedQuery]);

  const startups = useMemo(() => {
    if (searchResults?.startups) {
      return searchResults.startups;
    }
    return initialStartups.filter((s) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.industry?.toLowerCase().includes(q)
      );
    });
  }, [searchResults, initialStartups, debouncedQuery]);

  const communities = useMemo(() => {
    if (searchResults?.communities) {
      return searchResults.communities;
    }
    return initialCommunities.filter((c) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    });
  }, [searchResults, initialCommunities, debouncedQuery]);

  const users = useMemo(() => {
    if (searchResults?.people) {
      return searchResults.people;
    }
    return initialUsers.filter((u) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.profile?.headline?.toLowerCase().includes(q)
      );
    });
  }, [searchResults, initialUsers, debouncedQuery]);

  // Apply filters
  const filteredOpps = useMemo(() => {
    return opportunities.filter((o: any) => {
      if (workModeFilter !== "ALL" && o.workMode !== workModeFilter) return false;
      if (typeFilter !== "ALL" && o.type !== typeFilter) return false;
      return true;
    });
  }, [opportunities, workModeFilter, typeFilter]);

  const filteredEvents = useMemo(() => {
    return events.filter((e: any) => {
      if (formatFilter !== "ALL" && e.format !== formatFilter) return false;
      return true;
    });
  }, [events, formatFilter]);

  // Real Counts for Categories Navigation
  const dynamicCounts = useMemo(() => {
    if (debouncedQuery) {
      return {
        all:
          users.length +
          startups.length +
          projects.length +
          filteredOpps.length +
          filteredEvents.length +
          hackathons.length +
          communities.length,
        people: users.length,
        startups: startups.length,
        projects: projects.length,
        opportunities: filteredOpps.length,
        events: filteredEvents.length,
        hackathons: hackathons.length,
        communities: communities.length,
      };
    }
    return initialCounts;
  }, [
    debouncedQuery,
    users.length,
    startups.length,
    projects.length,
    filteredOpps.length,
    filteredEvents.length,
    hackathons.length,
    communities.length,
    initialCounts,
  ]);

  const categories: CategoryItem[] = [
    { id: "all", label: "All Results", count: dynamicCounts.all },
    { id: "people", label: "People", icon: Users, count: dynamicCounts.people },
    { id: "startups", label: "Startups", icon: Rocket, count: dynamicCounts.startups },
    { id: "projects", label: "Projects", icon: FolderKanban, count: dynamicCounts.projects },
    { id: "opportunities", label: "Opportunities", icon: Briefcase, count: dynamicCounts.opportunities },
    { id: "events", label: "Events", icon: Calendar, count: dynamicCounts.events },
    { id: "hackathons", label: "Hackathons", icon: Trophy, count: dynamicCounts.hackathons },
    { id: "communities", label: "Communities", icon: Users2, count: dynamicCounts.communities },
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar & Active Filters */}
      <div className="space-y-3">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across people, startups, projects, opportunities, events, and communities..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E5E5EA] bg-white text-[14px] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden shadow-2xs"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : isSearching ? (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0071E3] animate-spin" />
          ) : null}
        </div>

        {/* Real Filter Chips for Opportunities & Events */}
        {(activeTab === "all" || activeTab === "opportunities") && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[#86868B] flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Filters:
            </span>
            {/* Work Mode */}
            {["ALL", "REMOTE", "HYBRID", "ONSITE"].map((mode) => (
              <button
                key={mode}
                onClick={() => setWorkModeFilter(mode)}
                className={`text-[11.5px] px-2.5 py-1 rounded-full border transition-all ${
                  workModeFilter === mode
                    ? "bg-[#0071E3] text-white border-[#0071E3] font-medium"
                    : "bg-white text-[#6E6E73] border-[#E5E5EA] hover:border-[#D1D1D6]"
                }`}
              >
                {mode === "ALL" ? "All Modes" : mode}
              </button>
            ))}
            <div className="h-3 w-px bg-[#E5E5EA] mx-1" />
            {/* Type */}
            {["ALL", "JOB", "INTERNSHIP", "BOUNTY", "FELLOWSHIP"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`text-[11.5px] px-2.5 py-1 rounded-full border transition-all ${
                  typeFilter === t
                    ? "bg-[#1D1D1F] text-white border-[#1D1D1F] font-medium"
                    : "bg-white text-[#6E6E73] border-[#E5E5EA] hover:border-[#D1D1D6]"
                }`}
              >
                {t === "ALL" ? "All Types" : t.replace("_", " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* In-page Category Navigation */}
      <CategoryNavigation
        categories={categories}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* Loading Skeletons during Search */}
      {isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl border border-[#E5E5EA] bg-white space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <div className="pt-3 border-t border-[#F0F0F2] flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: ALL or OPPORTUNITIES */}
      {!isSearching && (activeTab === "all" || activeTab === "opportunities") && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
              Opportunities ({filteredOpps.length})
            </h2>
            <Link
              href="/opportunities"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {filteredOpps.length === 0 ? (
            <EmptyState
              title="No opportunities found"
              description={debouncedQuery ? `No active opportunities matched "${debouncedQuery}".` : "There are currently no active opportunities posted in this category."}
              action={
                debouncedQuery ? (
                  <button
                    onClick={() => {
                      setQuery("");
                      setWorkModeFilter("ALL");
                      setTypeFilter("ALL");
                    }}
                    className="text-xs text-[#0071E3] font-medium hover:underline"
                  >
                    Clear search and filters
                  </button>
                ) : (
                  <Link
                    href="/dashboard/recruiter"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-medium"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Post an Opportunity</span>
                  </Link>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpps.map((item: any) => (
                <OpportunityCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  organization={item.organization?.name || item.orgName || "Verified Organization"}
                  organizationSlug={item.organization?.slug || item.orgSlug}
                  location={item.location || "Remote"}
                  type={item.type || "JOB"}
                  workMode={item.workMode || "REMOTE"}
                  stipend={item.compensation || item.stipend || null}
                  skills={
                    Array.isArray(item.skills)
                      ? item.skills.map((s: any) => (typeof s === "string" ? s : s.skill?.name || s.name || "Engineering"))
                      : []
                  }
                  isVerified={item.organization?.verificationStatus === "VERIFIED"}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: ALL or STARTUPS */}
      {!isSearching && (activeTab === "all" || activeTab === "startups") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
              Startups ({startups.length})
            </h2>
            <Link
              href="/startups"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              Explore all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {startups.length === 0 ? (
            <EmptyState
              title="No startups found"
              description={debouncedQuery ? `No startups matched "${debouncedQuery}".` : "No startups have launched yet in this ecosystem view."}
              action={
                <Link
                  href="/startups/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-medium"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Launch a Startup</span>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {startups.map((item: any) => (
                <StartupCard
                  key={item.id || item.slug}
                  id={item.id}
                  slug={item.slug || item.id}
                  name={item.name}
                  description={item.description}
                  industry={item.industry}
                  stage={item.stage}
                  location={item.location}
                  logo={item.logo}
                  membersCount={item._count?.members || item.memberCount || 1}
                  hiringCount={item._count?.hiringNeeds || 0}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: ALL or PROJECTS */}
      {!isSearching && (activeTab === "all" || activeTab === "projects") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
              Projects & Workspaces ({projects.length})
            </h2>
            <Link
              href="/projects"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              title="No projects available yet"
              description={debouncedQuery ? `No projects match "${debouncedQuery}".` : "There are currently no active project workspaces listed."}
              action={
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-medium"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Create a Project</span>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((item: any) => (
                <ProjectCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description || item.scope || item.deliverable || "Collaborative engineering workspace."}
                  ownerName={item.organization?.name || item.orgName || "Orbit Team"}
                  category={item.category || "Engineering"}
                  status={item.status || "Active"}
                  membersCount={item._count?.applications || 1}
                  openRolesCount={item.openRolesCount || 0}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: ALL or EVENTS */}
      {!isSearching && (activeTab === "all" || activeTab === "events") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
              Upcoming Events ({filteredEvents.length})
            </h2>
            <Link
              href="/events"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {filteredEvents.length === 0 ? (
            <EmptyState
              title="No upcoming events"
              description={debouncedQuery ? `No events matched "${debouncedQuery}".` : "There are no upcoming summits or meetups scheduled at this time."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((item: any) => (
                <EventCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  organizer={item.organization?.name || item.organizerName || "Orbit"}
                  date={item.startDate ? formatDate(item.startDate) : "Upcoming"}
                  location={item.city || (item.format === "ONLINE" ? "Online" : "TBD")}
                  format={item.format || "ONLINE"}
                  category={item.type?.replace("_", " ") || "Event"}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: ALL or HACKATHONS */}
      {!isSearching && (activeTab === "all" || activeTab === "hackathons") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
              Hackathons ({hackathons.length})
            </h2>
            <Link
              href="/events"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              Explore hackathons <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {hackathons.length === 0 ? (
            <EmptyState
              title="No active hackathons"
              description={debouncedQuery ? `No hackathons matched "${debouncedQuery}".` : "Check back soon for upcoming hackathons and builder sprints."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hackathons.map((item: any) => (
                <HackathonCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  organizer={item.organization?.name || item.organizerName || "Orbit Foundation"}
                  dates={item.startDate ? formatDate(item.startDate) : "Upcoming"}
                  prizePool={item.price ? `${item.price} Prize Pool` : null}
                  mode={item.format || "ONLINE"}
                  teamsCount={item._count?.registrations || 0}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: ALL or COMMUNITIES */}
      {!isSearching && (activeTab === "all" || activeTab === "communities") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
              Communities ({communities.length})
            </h2>
            <Link
              href="/communities"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {communities.length === 0 ? (
            <EmptyState
              title="No communities found"
              description={debouncedQuery ? `No communities match "${debouncedQuery}".` : "There are currently no public builder spaces."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.map((item: any) => (
                <CommunityCard
                  key={item.slug || item.id}
                  slug={item.slug || item.id}
                  name={item.name}
                  description={item.description || "A curated space for collaborative builders on Orbit."}
                  membersCount={item._count?.members || item.memberCount || 0}
                  isVerified={true}
                  category={item.category || "Community"}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: ALL or PEOPLE */}
      {!isSearching && (activeTab === "all" || activeTab === "people") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
              People ({users.length})
            </h2>
            <Link
              href="/network"
              className="text-[13px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
            >
              Explore network <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {users.length === 0 ? (
            <EmptyState
              title="No members found"
              description={debouncedQuery ? `No members matched "${debouncedQuery}".` : "No public members in this directory view."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u: any) => (
                <Link
                  key={u.id}
                  href={u.username ? `/u/${u.username}` : `/profile/${u.id}`}
                  className="block p-5 rounded-2xl border border-[#E5E5EA] bg-white hover:border-[#D1D1D6] hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center font-semibold text-[#1D1D1F] overflow-hidden flex-shrink-0">
                      {u.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.image} alt={u.name} className="h-full w-full object-cover" />
                      ) : (
                        (u.name || "OR").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold text-[#1D1D1F] truncate">
                        {u.name || "Orbit Member"}
                      </h3>
                      <p className="text-[12.5px] text-[#6E6E73] truncate">
                        {u.profile?.headline || u.headline || u.role || "Builder"}
                      </p>
                      {u.profile?.location && (
                        <p className="text-[11px] text-[#86868B] truncate mt-0.5">
                          {u.profile.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
