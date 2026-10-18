export interface DemoProjectMilestone {
  id: string;
  title: string;
  description: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED";
  dueDate: string;
}

export interface DemoProjectTask {
  id: string;
  title: string;
  status: "DONE" | "IN_PROGRESS" | "TODO";
  assignedTo?: string;
}

export interface DemoProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  problem: string;
  solution: string;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  members: Array<{ userId: string; name: string; role: string }>;
  openRoles: string[];
  skills: string[];
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  milestones: DemoProjectMilestone[];
  tasks: DemoProjectTask[];
  createdAt: string;
  category: string;
}

const now = Date.now();

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: "demo-proj-career-copilot",
    title: "AI Career Copilot",
    slug: "ai-career-copilot",
    description:
      "Autonomous skill extraction, GitHub proof validation, and role matching engine for developers across India.",
    problem:
      "Indian computer science graduates struggle to stand out through traditional keyword resumes, while startups find it difficult to verify authentic hands-on coding capabilities.",
    solution:
      "A verifiable portfolio analyzer that inspects commit history, PR complexity, and architecture choices to generate cryptographic proof-of-work badges.",
    ownerId: "demo-talent",
    ownerName: "Aarav Sharma",
    ownerRole: "Lead Developer & Architect",
    members: [
      { userId: "demo-talent", name: "Aarav Sharma", role: "Project Lead" },
      { userId: "demo-mentor", name: "Dr. Ananya Iyer", role: "Technical Advisor" },
    ],
    openRoles: ["FastAPI Backend Developer", "UI Systems Designer"],
    skills: ["React", "TypeScript", "Python", "FastAPI", "Vector DB", "PostgreSQL"],
    status: "IN_PROGRESS",
    category: "AI & Developer Tools",
    createdAt: new Date(now - 3600000 * 24 * 14).toISOString(),
    milestones: [
      {
        id: "m-1",
        title: "Vector embedding pipeline for resumes",
        description: "Implemented chunking and cosine similarity matching over ESCO skill taxonomies.",
        status: "COMPLETED",
        dueDate: new Date(now - 3600000 * 24 * 2).toISOString(),
      },
      {
        id: "m-2",
        title: "Skill taxonomy matching engine",
        description: "Building deterministic scoring formula across 5 core career signals.",
        status: "IN_PROGRESS",
        dueDate: new Date(now + 3600000 * 24 * 10).toISOString(),
      },
      {
        id: "m-3",
        title: "End-to-end evaluation harness",
        description: "Synthesize benchmarks comparing verified skill claims vs actual pull requests.",
        status: "PLANNED",
        dueDate: new Date(now + 3600000 * 24 * 24).toISOString(),
      },
    ],
    tasks: [
      { id: "t-1", title: "Implement client token refresher", status: "DONE", assignedTo: "Aarav Sharma" },
      { id: "t-2", title: "Integrate Indian university grading scale", status: "IN_PROGRESS", assignedTo: "Aarav Sharma" },
      { id: "t-3", title: "Review evaluation rubric with Dr. Ananya", status: "TODO", assignedTo: "Dr. Ananya Iyer" },
    ],
  },
  {
    id: "demo-proj-bharat-commerce",
    title: "Bharat Local Commerce Platform",
    slug: "bharat-local-commerce",
    description:
      "Zero-commission open network commerce interface for local retailers and Tier 2/3 town artisans.",
    problem:
      "Small Indian shop owners pay steep 20-30% aggregator commissions and lack digital storefronts connected to Open Network for Digital Commerce (ONDC).",
    solution:
      "A lightweight Next.js PWA that syncs regional inventory via WhatsApp audio notes and publishes directly to ONDC-compatible buyer apps.",
    ownerId: "demo-organization",
    ownerName: "Vikram Malhotra",
    ownerRole: "Ecosystem Sponsor",
    members: [
      { userId: "demo-organization", name: "Vikram Malhotra", role: "Sponsor" },
      { userId: "demo-recruiter", name: "Karan Verma", role: "Talent Partner" },
    ],
    openRoles: ["Full-Stack Next.js Developer", "Mobile React Native Specialist"],
    skills: ["Next.js", "PostgreSQL", "UPI Integration", "TypeScript", "Tailwind CSS"],
    status: "OPEN",
    category: "Commerce & Infrastructure",
    createdAt: new Date(now - 3600000 * 24 * 20).toISOString(),
    milestones: [
      {
        id: "bm-1",
        title: "ONDC Beckn protocol adapter",
        description: "Core search and catalog publish endpoints.",
        status: "COMPLETED",
        dueDate: new Date(now - 3600000 * 24 * 5).toISOString(),
      },
      {
        id: "bm-2",
        title: "UPI instant settlement microservice",
        description: "Zero-latency webhook handler for QR-based merchant payments.",
        status: "IN_PROGRESS",
        dueDate: new Date(now + 3600000 * 24 * 14).toISOString(),
      },
    ],
    tasks: [
      { id: "bt-1", title: "Verify webhook signatures", status: "DONE", assignedTo: "Vikram Malhotra" },
      { id: "bt-2", title: "Build responsive merchant product card", status: "IN_PROGRESS" },
    ],
  },
  {
    id: "demo-proj-campus-engine",
    title: "Campus Opportunity Engine",
    slug: "campus-opportunity-engine",
    description:
      "Decentralized placement and internship discovery system for Indian engineering colleges.",
    problem:
      "Tier 2/3 college students are often gatekept from top startup internships by campus placement cell bureaucracy.",
    solution:
      "An open meritocratic leaderboard matching students directly to verified startups using verifiable proof of work.",
    ownerId: "demo-organizer",
    ownerName: "Neha Kapoor",
    ownerRole: "Community Lead",
    members: [{ userId: "demo-organizer", name: "Neha Kapoor", role: "Organizer" }],
    openRoles: ["Frontend Developer", "Outreach Lead"],
    skills: ["React", "Tailwind CSS", "Node.js", "PostgreSQL"],
    status: "IN_PROGRESS",
    category: "EdTech & Community",
    createdAt: new Date(now - 3600000 * 24 * 15).toISOString(),
    milestones: [
      {
        id: "cm-1",
        title: "College onboarding directory",
        description: "Index verified Indian engineering colleges and universities.",
        status: "COMPLETED",
        dueDate: new Date(now - 3600000 * 24 * 3).toISOString(),
      },
      {
        id: "cm-2",
        title: "Student hackathon badge sync",
        description: "Link hackathon achievements directly to Orbit student profiles.",
        status: "IN_PROGRESS",
        dueDate: new Date(now + 3600000 * 24 * 12).toISOString(),
      },
    ],
    tasks: [
      { id: "ct-1", title: "Design badge claim flow", status: "IN_PROGRESS", assignedTo: "Neha Kapoor" },
      { id: "ct-2", title: "Document API schema for student submissions", status: "TODO" },
    ],
  },
  {
    id: "demo-proj-healthcare-assistant",
    title: "Healthcare Appointment Assistant",
    slug: "healthcare-appointment-assistant",
    description:
      "Multilingual voice-first clinic triage and appointment scheduling for regional healthcare centres.",
    problem:
      "Regional patients struggle with complex smartphone booking forms and long outpatient queue times.",
    solution:
      "An AI voice triage agent supporting Hindi, Tamil, Telugu, and Kannada that converts natural voice queries into structured clinic tokens.",
    ownerId: "demo-mentor",
    ownerName: "Dr. Ananya Iyer",
    ownerRole: "Principal Advisor",
    members: [{ userId: "demo-mentor", name: "Dr. Ananya Iyer", role: "Principal Advisor" }],
    openRoles: ["NLP Speech Engineer", "Python Backend Developer"],
    skills: ["Python", "Whisper", "FastAPI", "Hindi NLP", "Tamil NLP"],
    status: "IN_PROGRESS",
    category: "AI & HealthTech",
    createdAt: new Date(now - 3600000 * 24 * 18).toISOString(),
    milestones: [
      {
        id: "hm-1",
        title: "Acoustic noise suppression pipeline",
        description: "Optimized for OPD background ambient audio.",
        status: "COMPLETED",
        dueDate: new Date(now - 3600000 * 24 * 4).toISOString(),
      },
    ],
    tasks: [
      { id: "ht-1", title: "Record multilingual acoustic sample test set", status: "DONE" },
      { id: "ht-2", title: "Implement FastAPI audio stream chunker", status: "IN_PROGRESS" },
    ],
  },
  {
    id: "demo-proj-oss-analytics",
    title: "Open Source Developer Analytics",
    slug: "open-source-developer-analytics",
    description:
      "Cryptographic proof-of-contribution verifier tracking PR quality, merge velocity, and code review impact.",
    problem:
      "Technical recruiters are overwhelmed by vanity GitHub stars and green commit squares that do not reflect actual code complexity.",
    solution:
      "Deep static analysis calculating cyclomatic complexity, test coverage contribution, and peer review rigor to certify engineer seniority.",
    ownerId: "demo-recruiter",
    ownerName: "Karan Verma",
    ownerRole: "Talent Architect",
    members: [{ userId: "demo-recruiter", name: "Karan Verma", role: "Product Owner" }],
    openRoles: ["Rust Systems Developer", "Data Engineer"],
    skills: ["Rust", "PostgreSQL", "GitHub API", "Data Pipelines"],
    status: "OPEN",
    category: "Developer Tools",
    createdAt: new Date(now - 3600000 * 24 * 22).toISOString(),
    milestones: [
      {
        id: "om-1",
        title: "GitHub Webhook & Event Ingestion",
        description: "Capture push, pull request, and issue comment events.",
        status: "COMPLETED",
        dueDate: new Date(now - 3600000 * 24 * 6).toISOString(),
      },
    ],
    tasks: [
      { id: "ot-1", title: "Benchmark Rust parser throughput", status: "IN_PROGRESS" },
    ],
  },
  {
    id: "demo-proj-startup-workspace",
    title: "Startup Validation Workspace",
    slug: "startup-validation-workspace",
    description:
      "Structured customer discovery, hypothesis tracker, and problem-solution fit canvas for Indian founders.",
    problem:
      "Early founders spend months writing code before verifying customer willingness to pay.",
    solution:
      "A guided validation workspace linking user interview transcripts to prioritized feature backlog items with automated sentiment scoring.",
    ownerId: "demo-founder",
    ownerName: "Riya Mehta",
    ownerRole: "Founder Lead",
    members: [
      { userId: "demo-founder", name: "Riya Mehta", role: "Founder Lead" },
      { userId: "demo-talent", name: "Aarav Sharma", role: "Core Contributor" },
    ],
    openRoles: ["Full Stack Engineer", "Product Researcher"],
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    status: "IN_PROGRESS",
    category: "Venture Tools",
    createdAt: new Date(now - 3600000 * 24 * 25).toISOString(),
    milestones: [
      {
        id: "sm-1",
        title: "Customer Discovery Canvas v1",
        description: "Interactive hypothesis mapping and validation criteria.",
        status: "COMPLETED",
        dueDate: new Date(now - 3600000 * 24 * 8).toISOString(),
      },
      {
        id: "sm-2",
        title: "Interview audio transcription & tagging",
        description: "Extract customer pain points automatically with LLM coworkers.",
        status: "IN_PROGRESS",
        dueDate: new Date(now + 3600000 * 24 * 16).toISOString(),
      },
    ],
    tasks: [
      { id: "st-1", title: "Build customer quote extraction component", status: "DONE", assignedTo: "Aarav Sharma" },
      { id: "st-2", title: "Deploy initial pilot with 5 pre-seed founders", status: "IN_PROGRESS", assignedTo: "Riya Mehta" },
    ],
  },
];
