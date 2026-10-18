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
  dotId: "avis" | "scout" | "quill" | "relay";
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredDotMessage {
  id: string;
  conversationId?: string;
  dotId: "avis" | "scout" | "quill" | "relay";
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
    emailOutbox: Array<{
      id: string;
      userId: string;
      recipient: string;
      subject: string;
      body: string;
      sentAt: string;
      status: "SENT" | "PENDING" | "FAILED";
    }>;
  };
};

if (!globalStore.__ORBIT_STORE__) {
  const aetherStartup: StoredStartup = {
    id: "startup-aether-1",
    slug: "aether-dynamics",
    name: "Aether Dynamics",
    logo: null,
    description: "Autonomous workflow orchestration and verifiable cloud pipelines for enterprise teams.",
    problem: "Enterprise development teams waste thousands of hours weekly triaging flaky pipelines, manual role approvals, and unverified work deliverables.",
    solution: "A cryptographic verifiable workflow engine with zero-latency policy enforcement and unified AI mod agents.",
    industry: "Developer Tools",
    stage: "MVP",
    location: "San Francisco, CA (Hybrid)",
    website: "https://aetherdynamics.io",
    requiredSkills: "Next.js, TypeScript, Distributed Systems, Rust, PostgreSQL",
    creatorId: "demo-founder",
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    milestones: [
      {
        id: "m-1",
        startupId: "startup-aether-1",
        title: "Complete v1.0 Pilot Architecture",
        description: "Draft core state machine, verify deterministic cache, and publish SDK spec.",
        dueDate: new Date(Date.now() + 3600000 * 24 * 14).toISOString(),
        status: "IN_PROGRESS",
        createdAt: new Date().toISOString(),
      },
      {
        id: "m-2",
        startupId: "startup-aether-1",
        title: "Deploy Security & RLS Enforcement Layer",
        description: "Full Supabase and PostgreSQL RLS audit, RBAC integration, and token validation.",
        dueDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      },
      {
        id: "m-3",
        startupId: "startup-aether-1",
        title: "Onboard First 5 Enterprise Design Partners",
        description: "Direct engineering pilot feedback loops and SLAs.",
        dueDate: new Date(Date.now() + 3600000 * 24 * 45).toISOString(),
        status: "PLANNED",
        createdAt: new Date().toISOString(),
      },
    ],
    tasks: [
      {
        id: "t-1",
        startupId: "startup-aether-1",
        title: "Build client SDK token refresher",
        status: "DONE",
        assignedTo: "Sarah Chen",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t-2",
        startupId: "startup-aether-1",
        title: "Implement Groq LLM streaming adapter",
        status: "IN_PROGRESS",
        assignedTo: "Alex Rivera",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t-3",
        startupId: "startup-aether-1",
        title: "Design candidate technical rubric",
        status: "TODO",
        createdAt: new Date().toISOString(),
      },
    ],
    hiringNeeds: [
      {
        id: "h-1",
        startupId: "startup-aether-1",
        title: "Founding Full-Stack Systems Engineer",
        roleType: "FULL_TIME",
        count: 1,
        skills: ["Next.js", "TypeScript", "PostgreSQL"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "h-2",
        startupId: "startup-aether-1",
        title: "Senior Cloud Infrastructure Engineer",
        roleType: "CONTRACT",
        count: 1,
        skills: ["Docker", "Kubernetes", "Rust"],
        createdAt: new Date().toISOString(),
      },
    ],
    members: [
      {
        id: "sm-1",
        startupId: "startup-aether-1",
        userId: "demo-founder",
        role: "FOUNDER",
        name: "Sarah Chen",
        joinedAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      },
      {
        id: "sm-2",
        startupId: "startup-aether-1",
        userId: "demo-student",
        role: "CO_FOUNDER",
        name: "Alex Rivera",
        joinedAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
      },
    ],
  };

  const startupsMap = new Map<string, StoredStartup>();
  startupsMap.set(aetherStartup.id, aetherStartup);
  startupsMap.set(aetherStartup.slug, aetherStartup);

  globalStore.__ORBIT_STORE__ = {
    applications: new Map(),
    savedOpportunities: new Set(),
    posts: [
      {
        id: "post-demo-1",
        communitySlug: "systems-engineering",
        authorId: "demo-founder",
        authorName: "Sarah Chen",
        authorImage: null,
        content:
          "Welcome to the Systems Engineering community! Share your projects, ask questions about distributed protocols, and collaborate on open opportunities.",
        tags: ["welcome", "distributed-systems", "engineering"],
        likesCount: 14,
        commentsCount: 2,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        comments: [
          {
            id: "comment-demo-1",
            postId: "post-demo-1",
            authorId: "demo-student",
            authorName: "Alex Rivera",
            content: "Excited to collaborate on the consensus engine projects here!",
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
    emailOutbox: [],
  };
}

export const inMemoryStore = globalStore.__ORBIT_STORE__!;
