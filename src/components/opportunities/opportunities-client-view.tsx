"use client";

import React, { useState, useMemo } from "react";
import { Search, Briefcase, GraduationCap, FolderKanban, Terminal, Rocket } from "lucide-react";
import { CategoryNavigation, CategoryItem } from "@/components/ui/category-navigation";
import { OpportunityCard } from "@/components/ui/orbit-cards";
import { EmptyState } from "@/components/ui/feedback";

interface OpportunitiesClientViewProps {
  initialOpportunities: any[];
}

export function OpportunitiesClientView({
  initialOpportunities,
}: OpportunitiesClientViewProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  const categories: CategoryItem[] = [
    { id: "all", label: "All Roles" },
    { id: "JOB", label: "Jobs", icon: Briefcase },
    { id: "INTERNSHIP", label: "Internships", icon: GraduationCap },
    { id: "PAID_PROJECT", label: "Projects", icon: FolderKanban },
    { id: "FREELANCE", label: "Freelance", icon: Terminal },
    { id: "STARTUP_ROLE", label: "Startup Roles", icon: Rocket },
  ];

  const filteredOpps = useMemo(() => {
    return initialOpportunities.filter((opp) => {
      const matchesCategory =
        activeCategory === "all" ||
        opp.type === activeCategory ||
        (activeCategory === "FREELANCE" && opp.type === "PAID_PROJECT");

      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        opp.title.toLowerCase().includes(q) ||
        opp.organization?.name?.toLowerCase().includes(q) ||
        opp.location?.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [initialOpportunities, activeCategory, query]);

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <CategoryNavigation
          categories={categories}
          activeId={activeCategory}
          onChange={setActiveCategory}
          className="border-b-0"
        />

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868B]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E5E5EA] bg-white text-[13px] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-hidden"
          />
        </div>
      </div>

      {/* Grid of Opportunities */}
      {filteredOpps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpps.map((opp) => (
            <OpportunityCard
              key={opp.id}
              id={opp.id}
              title={opp.title}
              organization={opp.organization?.name || "Verified Organization"}
              organizationSlug={opp.organization?.slug}
              location={opp.location || "Remote"}
              type={opp.type}
              workMode={opp.workMode}
              stipend={opp.stipend}
              skills={opp.skills?.map((s: any) => s.skill?.name || s.name) || ["Engineering"]}
              isVerified={opp.organization?.verificationStatus === "VERIFIED"}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No opportunities found"
          description="Try broadening your category or search terms to see more positions."
        />
      )}
    </div>
  );
}
