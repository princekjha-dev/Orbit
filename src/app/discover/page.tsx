import React from "react";
import type { Metadata } from "next";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";
import { AppShell } from "@/components/layout/app-shell";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { DiscoverView } from "@/components/discover/discover-view";

export const metadata: Metadata = {
  title: "Discover",
  description: "Find people, startups, projects, opportunities, events, hackathons, and communities across Orbit.",
};

export default async function DiscoverPage() {
  let opportunities: any[] = [];
  let projects: any[] = [];
  let events: any[] = [];
  let hackathons: any[] = [];
  let startups: any[] = [];
  let communities: any[] = [];
  let users: any[] = [];

  let counts = {
    all: 0,
    people: 0,
    startups: 0,
    projects: 0,
    opportunities: 0,
    events: 0,
    hackathons: 0,
    communities: 0,
  };

  try {
    const [
      opps,
      projs,
      evs,
      hacks,
      starts,
      comms,
      usrs,
      cOpp,
      cProj,
      cEv,
      cHack,
      cStart,
      cComm,
      cUsr,
    ] = await Promise.all([
      // 1. Opportunities
      prisma.opportunity.findMany({
        where: { isActive: true, isDeleted: false },
        include: {
          organization: { select: { name: true, slug: true, verificationStatus: true } },
          skills: { include: { skill: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }).catch(() => []),

      // 2. Projects
      prisma.project.findMany({
        where: { isDeleted: false, status: { in: ["OPEN", "IN_PROGRESS"] } },
        include: {
          organization: { select: { name: true, slug: true } },
          skills: { include: { skill: true } },
          _count: { select: { applications: true, deliverables: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 12,
      }).catch(() => []),

      // 3. Events (non-hackathons)
      prisma.event.findMany({
        where: { isDeleted: false, type: { not: "HACKATHON" } },
        include: { organization: { select: { name: true, slug: true } } },
        orderBy: { startDate: "asc" },
        take: 12,
      }).catch(() => []),

      // 4. Hackathons
      prisma.event.findMany({
        where: { isDeleted: false, type: "HACKATHON" },
        include: {
          organization: { select: { name: true, slug: true } },
          _count: { select: { registrations: true } },
        },
        orderBy: { startDate: "asc" },
        take: 12,
      }).catch(() => []),

      // 5. Startups
      prisma.startup.findMany({
        include: {
          creator: { select: { name: true, username: true } },
          _count: { select: { members: true, milestones: true, hiringNeeds: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }).catch(() => []),

      // 6. Communities
      prisma.community.findMany({
        include: { _count: { select: { members: true, posts: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      }).catch(() => []),

      // 7. Users / People
      prisma.user.findMany({
        where: { isSuspended: false },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          role: true,
          profile: {
            select: {
              headline: true,
              location: true,
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }).catch(() => []),

      // Counts
      prisma.opportunity.count({ where: { isActive: true, isDeleted: false } }).catch(() => 0),
      prisma.project.count({ where: { isDeleted: false, status: { in: ["OPEN", "IN_PROGRESS"] } } }).catch(() => 0),
      prisma.event.count({ where: { isDeleted: false, type: { not: "HACKATHON" } } }).catch(() => 0),
      prisma.event.count({ where: { isDeleted: false, type: "HACKATHON" } }).catch(() => 0),
      prisma.startup.count().catch(() => 0),
      prisma.community.count().catch(() => 0),
      prisma.user.count({ where: { isSuspended: false } }).catch(() => 0),
    ]);

    opportunities = opps || [];
    projects = projs || [];
    events = evs || [];
    hackathons = hacks || [];
    startups = starts || [];
    communities = comms || [];
    users = usrs || [];

    counts = {
      opportunities: cOpp ?? opportunities.length,
      projects: cProj ?? projects.length,
      events: cEv ?? events.length,
      hackathons: cHack ?? hackathons.length,
      startups: cStart ?? startups.length,
      communities: cComm ?? communities.length,
      people: cUsr ?? users.length,
      all:
        (cOpp ?? opportunities.length) +
        (cProj ?? projects.length) +
        (cEv ?? events.length) +
        (cHack ?? hackathons.length) +
        (cStart ?? startups.length) +
        (cComm ?? communities.length) +
        (cUsr ?? users.length),
    };
  } catch {
    // Offline / fallback
  }

  // Merge in-memory dynamic items (e.g., dynamically created records during testing or development)
  if (inMemoryStore) {
    if (inMemoryStore.opportunities && inMemoryStore.opportunities.size > 0) {
      const memoryOpps = Array.from(inMemoryStore.opportunities.values()).filter(
        (o: any) => o.isActive && !o.isDeleted
      );
      for (const mo of memoryOpps) {
        if (!opportunities.some((o) => o.id === mo.id)) {
          opportunities.unshift(mo);
          counts.opportunities++;
          counts.all++;
        }
      }
    }

    if (inMemoryStore.startups && inMemoryStore.startups.size > 0 && startups.length === 0) {
      const memoryStartups = Array.from(inMemoryStore.startups.values()).map((st) => ({
        id: st.id,
        slug: st.slug,
        name: st.name,
        description: st.description,
        industry: st.industry,
        stage: st.stage,
        location: st.location,
        logo: st.logo,
        _count: {
          members: st.members?.length || 1,
          milestones: st.milestones?.length || 0,
          hiringNeeds: st.hiringNeeds?.length || 0,
        },
      }));
      startups = memoryStartups;
      counts.startups = memoryStartups.length;
      counts.all += memoryStartups.length;
    }
  }

  return (
    <AppShell>
      <OrbitHeader title="Discover" />
      <div className="atmos-discover min-h-screen px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-[1240px] mx-auto w-full">
        {/* Large Editorial Introduction */}
        <PageIntro
          eyebrow="Ecosystem Discovery"
          title="Find what's next."
          description="Discover people, projects, startups, opportunities, events, hackathons and communities across Orbit."
        />

        {/* Client Interactive Discovery Component with Category Navigation, Live Search, Real Filters, & Genuine Counts */}
        <DiscoverView
          initialOpportunities={opportunities}
          initialProjects={projects}
          initialEvents={events}
          initialHackathons={hackathons}
          initialStartups={startups}
          initialCommunities={communities}
          initialUsers={users}
          initialCounts={counts}
        />
      </div>
    </AppShell>
  );
}
