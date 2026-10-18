import { DEMO_ORGANIZATIONS } from "./demo-organizations";

export interface DemoOpportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    verificationStatus: string;
    location: string;
    logoUrl?: string | null;
  };
  location: string;
  type: "JOB" | "INTERNSHIP" | "PROJECT" | "STARTUP_ROLE";
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  compensation: string;
  stipend?: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  deadline?: string;
}

export const DEMO_OPPORTUNITIES: DemoOpportunity[] = [
  {
    id: "demo-opp-frontend-intern",
    title: "Frontend Engineer Intern",
    slug: "frontend-engineer-intern-nexora",
    description:
      "Join Nexora Labs to build intuitive, high-velocity web interfaces for our autonomous AI SaaS engine. You will collaborate directly with founder Riya Mehta to implement modern React 19, Next.js App Router features, and accessible UI component systems.",
    organizationId: DEMO_ORGANIZATIONS.nexora.id,
    organization: {
      id: DEMO_ORGANIZATIONS.nexora.id,
      name: DEMO_ORGANIZATIONS.nexora.name,
      slug: DEMO_ORGANIZATIONS.nexora.slug,
      verificationStatus: DEMO_ORGANIZATIONS.nexora.verificationStatus,
      location: DEMO_ORGANIZATIONS.nexora.location,
    },
    location: "Bengaluru, Karnataka (Hybrid)",
    type: "INTERNSHIP",
    workMode: "HYBRID",
    compensation: "₹4 LPA – ₹6 LPA",
    stipend: "₹4 LPA – ₹6 LPA",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "UI/UX Design"],
    responsibilities: [
      "Develop responsive Next.js 15 pages and reusable component design systems",
      "Integrate streaming LLM responses and client-side state caches",
      "Conduct unit and integration tests with Vitest and Playwright",
    ],
    requirements: [
      "Strong proficiency in TypeScript, React, and modern CSS/Tailwind",
      "Demonstrated portfolio or open-source GitHub contributions",
      "Basic understanding of RESTful and streaming API patterns",
    ],
    isActive: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 24 * 25).toISOString(),
  },
  {
    id: "demo-opp-ai-intern",
    title: "AI Engineering Intern",
    slug: "ai-engineering-intern-nexora",
    description:
      "Nexora Labs is seeking an AI Engineering Intern to develop and benchmark autonomous agent orchestration pipelines. You will work on context compaction, tool-calling execution engines, and local model inference adapters.",
    organizationId: DEMO_ORGANIZATIONS.nexora.id,
    organization: {
      id: DEMO_ORGANIZATIONS.nexora.id,
      name: DEMO_ORGANIZATIONS.nexora.name,
      slug: DEMO_ORGANIZATIONS.nexora.slug,
      verificationStatus: DEMO_ORGANIZATIONS.nexora.verificationStatus,
      location: DEMO_ORGANIZATIONS.nexora.location,
    },
    location: "Remote (India)",
    type: "INTERNSHIP",
    workMode: "REMOTE",
    compensation: "₹5 LPA – ₹8 LPA",
    stipend: "₹5 LPA – ₹8 LPA",
    skills: ["Python", "FastAPI", "AI/ML", "LLMs", "PyTorch"],
    responsibilities: [
      "Build low-latency FastAPI endpoints for vector search and prompt pipelines",
      "Benchmark retrieval quality across synthetic test suites",
      "Design safe fallback handlers for LLM rate limits and network interruptions",
    ],
    requirements: [
      "Working knowledge of Python 3.11+, async programming, and FastAPI",
      "Hands-on experience with OpenAI / Groq APIs or HuggingFace transformers",
      "Familiarity with embeddings, vector databases, and cosine similarity",
    ],
    isActive: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 24 * 20).toISOString(),
  },
  {
    id: "demo-opp-product-designer",
    title: "Product Designer",
    slug: "product-designer-astra",
    description:
      "Astra Digital Technologies is hiring a Product Designer to craft elegant design systems, typography standards, and frictionless enterprise developer consoles.",
    organizationId: DEMO_ORGANIZATIONS.astra.id,
    organization: {
      id: DEMO_ORGANIZATIONS.astra.id,
      name: DEMO_ORGANIZATIONS.astra.name,
      slug: DEMO_ORGANIZATIONS.astra.slug,
      verificationStatus: DEMO_ORGANIZATIONS.astra.verificationStatus,
      location: DEMO_ORGANIZATIONS.astra.location,
    },
    location: "Gurugram, Haryana (Hybrid)",
    type: "JOB",
    workMode: "HYBRID",
    compensation: "₹8 LPA – ₹14 LPA",
    stipend: "₹8 LPA – ₹14 LPA",
    skills: ["Figma", "UI/UX Design", "Design Systems", "Prototyping", "User Research"],
    responsibilities: [
      "Maintain and evolve Astra's multi-platform Figma design token library",
      "Produce high-fidelity clickable prototypes for complex cloud telemetry dashboards",
      "Collaborate directly with frontend engineers to ensure pixel-perfect delivery",
    ],
    requirements: [
      "2+ years of software product design experience or comprehensive case studies",
      "Mastery of Figma components, autolayout, variables, and interaction design",
      "Deep appreciation for clean, minimalist Apple-inspired aesthetics",
    ],
    isActive: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
  },
  {
    id: "demo-opp-fullstack-dev",
    title: "Full Stack Developer",
    slug: "full-stack-developer-astra",
    description:
      "Architect and scale distributed enterprise microservices at Astra Digital Technologies. You will build high-concurrency event ingestion pipelines with Next.js, Node.js, and PostgreSQL.",
    organizationId: DEMO_ORGANIZATIONS.astra.id,
    organization: {
      id: DEMO_ORGANIZATIONS.astra.id,
      name: DEMO_ORGANIZATIONS.astra.name,
      slug: DEMO_ORGANIZATIONS.astra.slug,
      verificationStatus: DEMO_ORGANIZATIONS.astra.verificationStatus,
      location: DEMO_ORGANIZATIONS.astra.location,
    },
    location: "Pune / Remote (India)",
    type: "JOB",
    workMode: "REMOTE",
    compensation: "₹10 LPA – ₹16 LPA",
    stipend: "₹10 LPA – ₹16 LPA",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker"],
    responsibilities: [
      "Build resilient REST and GraphQL APIs backed by PostgreSQL and Prisma ORM",
      "Implement multi-tenant authorization policies and database indexing strategies",
      "Collaborate on technical pairing interviews and candidate mentorship",
    ],
    requirements: [
      "Solid foundation in TypeScript, Node.js, and relational database schema design",
      "Experience with Next.js server actions, middleware, and SSR performance",
      "Understanding of security practices (OWASP, RBAC, input validation)",
    ],
    isActive: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 24 * 35).toISOString(),
  },
  {
    id: "demo-opp-ml-engineer",
    title: "Machine Learning Engineer",
    slug: "machine-learning-engineer-orbit-labs",
    description:
      "Orbit Research Labs is recruiting a Machine Learning Engineer to evaluate foundational agent models and create cryptographic verification benchmarks for verifiable code generation.",
    organizationId: DEMO_ORGANIZATIONS.orbitLabs.id,
    organization: {
      id: DEMO_ORGANIZATIONS.orbitLabs.id,
      name: DEMO_ORGANIZATIONS.orbitLabs.name,
      slug: DEMO_ORGANIZATIONS.orbitLabs.slug,
      verificationStatus: DEMO_ORGANIZATIONS.orbitLabs.verificationStatus,
      location: DEMO_ORGANIZATIONS.orbitLabs.location,
    },
    location: "Hyderabad, Telangana (Onsite)",
    type: "JOB",
    workMode: "ONSITE",
    compensation: "₹12 LPA – ₹20 LPA",
    stipend: "₹12 LPA – ₹20 LPA",
    skills: ["Python", "Machine Learning", "PyTorch", "Distributed Systems", "FastAPI"],
    responsibilities: [
      "Design reproducible evaluation harnesses for LLM reasoning and code synthesis",
      "Train lightweight adapter checkpoints for specialized ESCO skill classification",
      "Publish open benchmark results with transparent empirical datasets",
    ],
    requirements: [
      "Degree in Computer Science, Data Science, or equivalent proven research track record",
      "Deep expertise with PyTorch, CUDA acceleration, and evaluation metrics",
      "Proficiency in statistical validation and distributed training workflows",
    ],
    isActive: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 24 * 40).toISOString(),
  },
  {
    id: "demo-opp-growth-intern",
    title: "Growth Intern",
    slug: "growth-intern-nexora",
    description:
      "Join Nexora Labs to drive early developer community engagement, organize product beta cohorts, and document developer success stories across Indian builder networks.",
    organizationId: DEMO_ORGANIZATIONS.nexora.id,
    organization: {
      id: DEMO_ORGANIZATIONS.nexora.id,
      name: DEMO_ORGANIZATIONS.nexora.name,
      slug: DEMO_ORGANIZATIONS.nexora.slug,
      verificationStatus: DEMO_ORGANIZATIONS.nexora.verificationStatus,
      location: DEMO_ORGANIZATIONS.nexora.location,
    },
    location: "Mumbai, Maharashtra (Hybrid)",
    type: "INTERNSHIP",
    workMode: "HYBRID",
    compensation: "₹3 LPA – ₹5 LPA",
    stipend: "₹3 LPA – ₹5 LPA",
    skills: ["Product Strategy", "Developer Relations", "User Research", "Content", "Analytics"],
    responsibilities: [
      "Facilitate user onboarding sessions with early engineering design partners",
      "Track product adoption funnels and synthesize qualitative feedback for engineering",
      "Co-host developer community workshops alongside India Builders Network",
    ],
    requirements: [
      "Excellent written and spoken communication skills",
      "Curiosity about AI products, developer workflows, and tech startup building",
      "Ability to thrive in an iterative, fast-paced pre-seed startup environment",
    ],
    isActive: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 24 * 28).toISOString(),
  },
];
