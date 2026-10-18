import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const category = (searchParams.get("category") || "ALL").toUpperCase();

  if (!q) {
    return NextResponse.json({
      success: true,
      results: {
        people: [],
        opportunities: [],
        projects: [],
        startups: [],
        communities: [],
        ideas: [],
        events: [],
      },
      counts: {
        all: 0,
        people: 0,
        opportunities: 0,
        projects: 0,
        startups: 0,
        communities: 0,
        ideas: 0,
        events: 0,
      },
    });
  }

  const user = await getCurrentUser();

  const searchPeople = category === "ALL" || category === "PEOPLE";
  const searchOpportunities = category === "ALL" || category === "OPPORTUNITIES";
  const searchProjects = category === "ALL" || category === "PROJECTS";
  const searchStartups = category === "ALL" || category === "STARTUPS";
  const searchCommunities = category === "ALL" || category === "COMMUNITIES";
  const searchIdeas = category === "ALL" || category === "IDEAS";
  const searchEvents = category === "ALL" || category === "EVENTS";

  const dbResults = await safeDbCall(
    () =>
      Promise.all([
        searchPeople
          ? prisma.user.findMany({
              where: {
                isSuspended: false,
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { username: { contains: q, mode: "insensitive" } },
                  { profile: { headline: { contains: q, mode: "insensitive" } } },
                ],
              },
              include: {
                profile: {
                  include: { skills: { include: { skill: true } } },
                },
              },
              take: 10,
            })
          : Promise.resolve([] as any[]),

        searchOpportunities
          ? prisma.opportunity.findMany({
              where: {
                isActive: true,
                isDeleted: false,
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              include: {
                organization: { select: { name: true, slug: true, logoUrl: true } },
                skills: { include: { skill: true } },
              },
              take: 10,
            })
          : Promise.resolve([] as any[]),

        searchProjects
          ? prisma.project.findMany({
              where: {
                isDeleted: false,
                status: "OPEN",
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { scope: { contains: q, mode: "insensitive" } },
                ],
              },
              include: {
                organization: { select: { name: true, slug: true, logoUrl: true } },
                skills: { include: { skill: true } },
              },
              take: 10,
            })
          : Promise.resolve([] as any[]),

        searchStartups
          ? prisma.startup.findMany({
              where: {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              include: {
                _count: { select: { members: true, milestones: true } },
              },
              take: 10,
            })
          : Promise.resolve([] as any[]),

        searchCommunities
          ? prisma.community.findMany({
              where: {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              include: {
                _count: { select: { members: true, posts: true } },
              },
              take: 10,
            })
          : Promise.resolve([] as any[]),

        searchIdeas
          ? prisma.idea.findMany({
              where: {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { problem: { contains: q, mode: "insensitive" } },
                ],
              },
              include: {
                creator: { select: { name: true, username: true } },
                _count: { select: { members: true } },
              },
              take: 10,
            })
          : Promise.resolve([] as any[]),

        searchEvents
          ? prisma.event.findMany({
              where: {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              take: 10,
            })
          : Promise.resolve([] as any[]),
      ]),
    [[], [], [], [], [], [], []]
  );

  const [
    people = [],
    opportunities = [],
    projects = [],
    startups = [],
    communities = [],
    ideas = [],
    events = [],
  ] = dbResults || [];

  const totalCount =
    people.length +
    opportunities.length +
    projects.length +
    startups.length +
    communities.length +
    ideas.length +
    events.length;

  return NextResponse.json({
    success: true,
    results: {
      people: people.map((p: any) => ({
        id: p.id,
        name: p.name,
        username: p.username,
        image: p.image,
        headline: p.profile?.headline,
        skills: p.profile?.skills?.map((s: any) => s.skill.name) || [],
      })),
      opportunities: opportunities.map((o: any) => ({
        id: o.id,
        title: o.title,
        orgName: o.organization?.name,
        orgSlug: o.organization?.slug,
        type: o.type,
        workMode: o.workMode,
        location: o.location,
        skills: o.skills?.map((s: any) => s.skill.name) || [],
      })),
      projects: projects.map((pr: any) => ({
        id: pr.id,
        title: pr.title,
        orgName: pr.organization?.name,
        deliverable: pr.deliverable,
        deadline: pr.deadline,
        skills: pr.skills?.map((s: any) => s.skill.name) || [],
      })),
      startups: startups.map((st: any) => ({
        id: st.id,
        slug: st.slug,
        name: st.name,
        description: st.description,
        industry: st.industry,
        stage: st.stage,
        memberCount: st._count?.members || 0,
      })),
      communities: communities.map((cm: any) => ({
        id: cm.id,
        slug: cm.slug,
        name: cm.name,
        description: cm.description,
        category: cm.category,
        memberCount: cm._count?.members || 0,
        postCount: cm._count?.posts || 0,
      })),
      ideas: ideas.map((id: any) => ({
        id: id.id,
        title: id.title,
        problem: id.problem,
        industry: id.industry,
        creatorName: id.creator?.name,
        creatorUsername: id.creator?.username,
        memberCount: id._count?.members || 0,
      })),
      events: events.map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        type: ev.type,
        format: ev.format,
        startDate: ev.startDate,
        organizerName: ev.organizerName,
      })),
    },
    counts: {
      all: totalCount,
      people: people.length,
      opportunities: opportunities.length,
      projects: projects.length,
      startups: startups.length,
      communities: communities.length,
      ideas: ideas.length,
      events: events.length,
    },
  });
}
