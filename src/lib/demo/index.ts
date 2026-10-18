export * from "./demo-users";
export * from "./demo-organizations";
export * from "./demo-opportunities";
export * from "./demo-projects";
export * from "./demo-events";
export * from "./demo-hackathons";
export * from "./demo-communities";
export * from "./demo-messages";
export * from "./demo-applications";
export * from "./demo-notifications";
export * from "./demo-resumes";

import { DEMO_USERS } from "./demo-users";
import { DEMO_ORGANIZATIONS } from "./demo-organizations";
import { DEMO_OPPORTUNITIES } from "./demo-opportunities";
import { DEMO_PROJECTS } from "./demo-projects";
import { DEMO_EVENTS } from "./demo-events";
import { DEMO_HACKATHONS } from "./demo-hackathons";
import { DEMO_COMMUNITIES } from "./demo-communities";
import { INITIAL_DEMO_CONVERSATIONS } from "./demo-messages";
import { INITIAL_DEMO_APPLICATIONS } from "./demo-applications";
import { inMemoryStore, StoredStartup } from "@/lib/database/in-memory-store";

/**
 * Initializes or resets the global in-memory store with synthetic Indian demo records.
 * Only touches demo accounts and records; NEVER deletes or alters real production users.
 */
export function initializeDemoStore() {
  // 1. Populate demo startups
  const nexoraStartup: StoredStartup = {
    id: "demo-startup-nexora",
    slug: "nexora-labs",
    name: "Nexora Labs",
    logo: null,
    description: "Autonomous workflow orchestration and verifiable cloud pipelines for enterprise teams.",
    problem: "Product engineering teams waste hundreds of hours each sprint resolving fragmented LLM pipelines, prompt regressions, and manual role approvals.",
    solution: "A cryptographic, verifiable agent engine with deterministic verification, multi-tenant state isolation, and unified AI coworker dots.",
    industry: "AI / SaaS",
    stage: "MVP",
    location: "Mumbai & Bengaluru, India (Hybrid)",
    website: "https://nexoralabs.ai",
    requiredSkills: "Next.js, TypeScript, Python, FastAPI, PostgreSQL, PyTorch",
    creatorId: "demo-founder",
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    milestones: [
      {
        id: "m-1",
        startupId: "demo-startup-nexora",
        title: "Complete v1.0 Pilot Architecture",
        description: "Draft core state machine, verify deterministic cache, and publish SDK spec.",
        dueDate: new Date(Date.now() + 3600000 * 24 * 14).toISOString(),
        status: "IN_PROGRESS",
        createdAt: new Date().toISOString(),
      },
      {
        id: "m-2",
        startupId: "demo-startup-nexora",
        title: "Deploy Security & RLS Enforcement Layer",
        description: "Full Supabase and PostgreSQL RLS audit, RBAC integration, and token validation.",
        dueDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      },
      {
        id: "m-3",
        startupId: "demo-startup-nexora",
        title: "Onboard First 5 Enterprise Design Partners",
        description: "Direct engineering pilot feedback loops and SLAs in Bengaluru.",
        dueDate: new Date(Date.now() + 3600000 * 24 * 45).toISOString(),
        status: "PLANNED",
        createdAt: new Date().toISOString(),
      },
    ],
    tasks: [
      {
        id: "t-1",
        startupId: "demo-startup-nexora",
        title: "Build client SDK token refresher",
        status: "DONE",
        assignedTo: "Aarav Sharma",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t-2",
        startupId: "demo-startup-nexora",
        title: "Implement Groq LLM streaming adapter",
        status: "IN_PROGRESS",
        assignedTo: "Aarav Sharma",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t-3",
        startupId: "demo-startup-nexora",
        title: "Design candidate technical rubric",
        status: "TODO",
        createdAt: new Date().toISOString(),
      },
    ],
    hiringNeeds: [
      {
        id: "h-1",
        startupId: "demo-startup-nexora",
        title: "Frontend Engineer Intern",
        roleType: "INTERNSHIP",
        count: 1,
        skills: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "h-2",
        startupId: "demo-startup-nexora",
        title: "AI Engineering Intern",
        roleType: "INTERNSHIP",
        count: 1,
        skills: ["Python", "FastAPI", "AI/ML", "PyTorch"],
        createdAt: new Date().toISOString(),
      },
    ],
    members: [
      {
        id: "sm-1",
        startupId: "demo-startup-nexora",
        userId: "demo-founder",
        role: "FOUNDER",
        name: "Riya Mehta",
        joinedAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      },
      {
        id: "sm-2",
        startupId: "demo-startup-nexora",
        userId: "demo-talent",
        role: "CONTRIBUTOR",
        name: "Aarav Sharma",
        joinedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      },
    ],
  };

  inMemoryStore.startups.set(nexoraStartup.id, nexoraStartup);
  inMemoryStore.startups.set(nexoraStartup.slug, nexoraStartup);

  // 2. Populate demo opportunities
  for (const opp of DEMO_OPPORTUNITIES) {
    inMemoryStore.opportunities.set(opp.id, opp);
    inMemoryStore.opportunities.set(opp.slug, opp);
  }

  // 3. Populate demo projects
  for (const proj of DEMO_PROJECTS) {
    inMemoryStore.projects.set(proj.id, proj);
    inMemoryStore.projects.set(proj.slug, proj);
  }

  // 4. Populate demo events
  for (const ev of DEMO_EVENTS) {
    inMemoryStore.events.set(ev.id, ev);
    inMemoryStore.events.set(ev.slug, ev);
  }

  // 5. Populate demo communities
  for (const comm of DEMO_COMMUNITIES) {
    inMemoryStore.communities.set(comm.id, comm);
    inMemoryStore.communities.set(comm.slug, comm);
  }

  // 6. Populate demo applications
  for (const app of INITIAL_DEMO_APPLICATIONS) {
    inMemoryStore.applications.set(app.id, app as any);
    inMemoryStore.applications.set(`${app.opportunityId}:${app.userId}`, app as any);
  }

  // 7. Populate demo users in userProfiles
  for (const user of Object.values(DEMO_USERS)) {
    inMemoryStore.users.set(user.id, user);
    inMemoryStore.users.set(user.email, user);
    inMemoryStore.userProfiles.set(user.id, {
      userId: user.id,
      headline: user.headline,
      about: user.bio,
      location: user.location,
      skills: user.skills,
    });
  }
}

// Auto-initialize demo store on module evaluation
if (typeof globalThis !== "undefined") {
  initializeDemoStore();
}
