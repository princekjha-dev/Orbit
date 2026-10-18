export interface DemoComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export interface DemoPost {
  id: string;
  communitySlug: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  title?: string;
  content: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  comments: DemoComment[];
}

export interface DemoCommunity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: "AI" | "STARTUPS" | "PRODUCT" | "ENGINEERING" | "STUDENTS" | "DESIGN";
  membersCount: number;
  postsCount: number;
  isPrivate: boolean;
  announcement?: string;
  posts: DemoPost[];
}

const now = Date.now();

export const DEMO_COMMUNITIES: DemoCommunity[] = [
  {
    id: "demo-comm-ai-builders",
    name: "AI Builders India",
    slug: "ai-builders-india",
    description:
      "India's premier community of LLM engineers, researchers, and agentic systems developers building production AI software.",
    category: "AI",
    membersCount: 428,
    postsCount: 64,
    isPrivate: false,
    announcement: "Join us for the Bengaluru AI Hackathon next week! Office hours are open for early project reviews.",
    posts: [
      {
        id: "post-ai-1",
        communitySlug: "ai-builders-india",
        authorId: "demo-founder",
        authorName: "Riya Mehta",
        authorUsername: "demo_founder",
        title: "Evaluating LLM Agent Latency: Best practices for production SaaS",
        content:
          "At Nexora Labs, we cut our agent orchestration latency by 45% by streaming initial tool arguments and parallelizing non-dependent vector similarity searches. What strategies are other Indian AI builders using for context compaction?",
        tags: ["LLM", "AgenticAI", "Architecture", "Bengaluru"],
        likesCount: 38,
        commentsCount: 3,
        createdAt: new Date(now - 3600000 * 24).toISOString(),
        comments: [
          {
            id: "comm-ai-1-1",
            postId: "post-ai-1",
            authorId: "demo-talent",
            authorName: "Aarav Sharma",
            authorUsername: "demo_talent",
            content:
              "We noticed similar wins in the AI Career Copilot project by pre-caching user embeddings and using local token buffers. Great insight, Riya!",
            createdAt: new Date(now - 3600000 * 18).toISOString(),
          },
          {
            id: "comm-ai-1-2",
            postId: "post-ai-1",
            authorId: "demo-mentor",
            authorName: "Dr. Ananya Iyer",
            authorUsername: "demo_mentor",
            content:
              "Make sure to couple streaming with deterministic output validation schemas; don't compromise evaluation accuracy for 50ms latency.",
            createdAt: new Date(now - 3600000 * 12).toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: "demo-comm-startup-founders",
    name: "Startup Founders India",
    slug: "startup-founders-india",
    description:
      "Peer group of pre-seed to Series A founders building across SaaS, FinTech, and B2B in India.",
    category: "STARTUPS",
    membersCount: 312,
    postsCount: 48,
    isPrivate: false,
    announcement: "Founder & Talent matchday registration is now live.",
    posts: [
      {
        id: "post-sf-1",
        communitySlug: "startup-founders-india",
        authorId: "demo-organization",
        authorName: "Vikram Malhotra",
        authorUsername: "demo_org_admin",
        title: "Enterprise Pilot Checklist for Pre-Seed Founders",
        content:
          "Before approaching mid-market enterprises in Pune and Gurugram, make sure your security posture includes SOC2 readiness, SSO capability, and verifiable SLA documentation.",
        tags: ["B2B", "Enterprise", "Founders"],
        likesCount: 29,
        commentsCount: 1,
        createdAt: new Date(now - 3600000 * 36).toISOString(),
        comments: [
          {
            id: "comm-sf-1-1",
            postId: "post-sf-1",
            authorId: "demo-founder",
            authorName: "Riya Mehta",
            authorUsername: "demo_founder",
            content: "Solid checklist Vikram. We've set up DNS TXT domain verification on Orbit to build early buyer trust.",
            createdAt: new Date(now - 3600000 * 20).toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: "demo-comm-women-in-product",
    name: "Women in Product India",
    slug: "women-in-product-india",
    description:
      "Connecting product managers, designers, and tech leaders driving innovation across Bharat.",
    category: "PRODUCT",
    membersCount: 265,
    postsCount: 36,
    isPrivate: false,
    announcement: "Monthly advisory circle with Dr. Ananya Iyer on technical product roadmapping.",
    posts: [
      {
        id: "post-wip-1",
        communitySlug: "women-in-product-india",
        authorId: "demo-mentor",
        authorName: "Dr. Ananya Iyer",
        authorUsername: "demo_mentor",
        title: "Framework for AI Product Metrics Beyond Engagement",
        content:
          "In AI products, engagement can be misleading if users are stuck regenerating outputs. Measure task completion fidelity, proof-of-work acceptance rate, and user intervention frequency.",
        tags: ["ProductStrategy", "AIMetrics", "Leadership"],
        likesCount: 42,
        commentsCount: 2,
        createdAt: new Date(now - 3600000 * 48).toISOString(),
        comments: [],
      },
    ],
  },
  {
    id: "demo-comm-open-source",
    name: "Open Source India",
    slug: "open-source-india",
    description:
      "Collaborative space for contributors and maintainers building open public digital infrastructure.",
    category: "ENGINEERING",
    membersCount: 518,
    postsCount: 82,
    isPrivate: false,
    announcement: "Sprint kickoff: ONDC open developer tools and TypeScript SDK contributions.",
    posts: [
      {
        id: "post-oss-1",
        communitySlug: "open-source-india",
        authorId: "demo-talent",
        authorName: "Aarav Sharma",
        authorUsername: "demo_talent",
        title: "Published Open Source Vector Cache Engine for Next.js 15",
        content:
          "Hey everyone! I just published a lightweight TypeScript package that caches cosine similarity lookups in Redis/memory with sub-5ms lookups. Check it out on GitHub and share feedback!",
        tags: ["OpenSource", "TypeScript", "Nextjs", "Performance"],
        likesCount: 56,
        commentsCount: 4,
        createdAt: new Date(now - 3600000 * 16).toISOString(),
        comments: [],
      },
    ],
  },
  {
    id: "demo-comm-student-developers",
    name: "Student Developers India",
    slug: "student-developers-india",
    description:
      "Hackathon builders, competitive programmers, and aspiring engineers from Indian universities.",
    category: "STUDENTS",
    membersCount: 680,
    postsCount: 112,
    isPrivate: false,
    announcement: "Orbit India Buildathon 2026 registrations are live! Total prize pool ₹1,75,000.",
    posts: [
      {
        id: "post-sd-1",
        communitySlug: "student-developers-india",
        authorId: "demo-organizer",
        authorName: "Neha Kapoor",
        authorUsername: "demo_organizer",
        title: "Orbit India Buildathon 2026: Team Formations & Mentorship",
        content:
          "Excited to announce the Orbit India Buildathon! 3 tracks, ₹1,75,000 total prize pool, and 1:1 mentorship from startup founders. Form your teams or look for teammates in this thread!",
        tags: ["Hackathon", "Buildathon2026", "Students", "Prizes"],
        likesCount: 89,
        commentsCount: 6,
        createdAt: new Date(now - 3600000 * 12).toISOString(),
        comments: [
          {
            id: "comm-sd-1-1",
            postId: "post-sd-1",
            authorId: "demo-talent",
            authorName: "Aarav Sharma",
            authorUsername: "demo_talent",
            content: "Looking for 1 frontend designer and 1 backend Python developer for our AI Career Copilot track team!",
            createdAt: new Date(now - 3600000 * 8).toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: "demo-comm-designers-builders",
    name: "Designers & Builders India",
    slug: "designers-builders-india",
    description:
      "Crafting world-class design systems, typography, and micro-interactions for global software.",
    category: "DESIGN",
    membersCount: 194,
    postsCount: 28,
    isPrivate: false,
    announcement: "Apple Human Interface Guidelines & Minimalist Web Design teardown session.",
    posts: [
      {
        id: "post-db-1",
        communitySlug: "designers-builders-india",
        authorId: "demo-recruiter",
        authorName: "Karan Verma",
        authorUsername: "demo_recruiter",
        title: "What we look for in candidate design portfolios at Astra Digital",
        content:
          "We value designers who think in design tokens, understand CSS layout constraints, and design for edge cases rather than just static Dribbble mockups.",
        tags: ["DesignHiring", "UIUX", "DesignSystems"],
        likesCount: 34,
        commentsCount: 2,
        createdAt: new Date(now - 3600000 * 40).toISOString(),
        comments: [],
      },
    ],
  },
];
