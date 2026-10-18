/**
 * In-Memory Persistence Store for Orbit
 *
 * Ensures full end-to-end functionality, state updates, and reload persistence
 * across all workflows (Talent, Founder, Recruiter, Mentor, Community, Dots)
 * even when local PostgreSQL is not running or during offline development.
 */

export interface StoredApplication {
  id: string;
  opportunityId: string;
  userId: string;
  coverLetter: string;
  portfolioUrl?: string | null;
  status: "APPLIED" | "REVIEWING" | "SHORTLISTED" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface StoredPost {
  id: string;
  communitySlug: string;
  authorId: string;
  authorName: string;
  authorImage?: string | null;
  content: string;
  mediaUrl?: string | null;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  comments: StoredComment[];
}

export interface StoredComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface StoredEventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  status: "CONFIRMED" | "WAITLIST";
}

export interface StoredHackathonTeam {
  id: string;
  hackathonId: string;
  name: string;
  description: string;
  leaderId: string;
  members: Array<{ userId: string; name: string; role: string }>;
  submissionUrl?: string | null;
  submissionTitle?: string | null;
  submittedAt?: string | null;
  createdAt: string;
}

export interface StoredDotConversation {
  id: string;
  userId: string;
  dotId: "atlas" | "scout" | "forge" | "signal" | "avis" | "quill" | "relay" | string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredDotMessage {
  id: string;
  conversationId?: string;
  dotId: "atlas" | "scout" | "forge" | "signal" | "avis" | "quill" | "relay" | string;
  userId: string;
  sender: "user" | "dot";
  content: string;
  timestamp: string;
  actionResult?: {
    action: string;
    success: boolean;
    data?: any;
    links?: Array<{ title: string; href: string }>;
  };
}

export interface StoredStartupMilestone {
  id: string;
  startupId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
}

export interface StoredStartupTask {
  id: string;
  startupId: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignedTo?: string | null;
  dueDate?: string | null;
  createdAt: string;
}

export interface StoredStartupHiringNeed {
  id: string;
  startupId: string;
  title: string;
  roleType: string;
  count: number;
  skills: string[];
  createdAt: string;
}

export interface StoredStartupMember {
  id: string;
  startupId: string;
  userId: string;
  role: string;
  name?: string;
  joinedAt: string;
}

export interface StoredStartup {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  description: string;
  problem: string;
  solution: string;
  industry: string;
  stage: "IDEA" | "PROTOTYPE" | "MVP" | "LAUNCHED" | "SCALING";
  location?: string | null;
  website?: string | null;
  requiredSkills?: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  milestones: StoredStartupMilestone[];
  tasks: StoredStartupTask[];
  hiringNeeds: StoredStartupHiringNeed[];
  members: StoredStartupMember[];
}

// Global persistence store attached to globalThis to survive HMR reloads
const globalStore = globalThis as unknown as {
  __ORBIT_STORE__?: {
    applications: Map<string, StoredApplication>;
    savedOpportunities: Set<string>; // userId:opportunityId
    posts: StoredPost[];
    eventRegistrations: Map<string, StoredEventRegistration>; // userId:eventId
    hackathonTeams: Map<string, StoredHackathonTeam>;
    dotConversations: Map<string, StoredDotConversation>;
    dotMessages: Map<string, StoredDotMessage[]>; // userId:dotId or conversationId
    userProfiles: Map<string, any>;
    startups: Map<string, StoredStartup>; // id or slug -> StoredStartup
    opportunities: Map<string, any>;
    projects: Map<string, any>;
    events: Map<string, any>;
    communities: Map<string, any>;
    users: Map<string, any>;
    emailOutbox: Array<{
      id: string;
      userId: string;
      recipient: string;
      subject: string;
      body: string;
      sentAt?: string;
      status: "SENT" | "PENDING" | "FAILED" | "APPROVED" | "SKIPPED";
      providerMessageId?: string;
    }>;
  };
};

if (!globalStore.__ORBIT_STORE__) {
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

  const startupsMap = new Map<string, StoredStartup>();
  startupsMap.set(nexoraStartup.id, nexoraStartup);
  startupsMap.set(nexoraStartup.slug, nexoraStartup);

  globalStore.__ORBIT_STORE__ = {
    applications: new Map(),
    savedOpportunities: new Set(),
    posts: [
      {
        id: "post-demo-1",
        communitySlug: "ai-builders-india",
        authorId: "demo-founder",
        authorName: "Riya Mehta",
        authorImage: null,
        content:
          "Welcome to the AI Builders India community! Share your projects, discuss autonomous agent protocols, and collaborate on open opportunities.",
        tags: ["welcome", "ai-agents", "engineering", "bengaluru"],
        likesCount: 28,
        commentsCount: 2,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        comments: [
          {
            id: "comment-demo-1",
            postId: "post-demo-1",
            authorId: "demo-talent",
            authorName: "Aarav Sharma",
            content: "Excited to collaborate on the AI Career Copilot and agent evaluation projects here!",
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          },
        ],
      },
    ],
    eventRegistrations: new Map(),
    hackathonTeams: new Map(),
    dotConversations: new Map(),
    dotMessages: new Map(),
    userProfiles: new Map(),
    startups: startupsMap,
    opportunities: new Map(),
    projects: new Map(),
    events: new Map(),
    communities: new Map(),
    users: new Map(),
    emailOutbox: [],
  };
}

export const inMemoryStore = globalStore.__ORBIT_STORE__!;
