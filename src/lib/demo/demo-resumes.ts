export interface DemoResume {
  userId: string;
  name: string;
  title: string;
  headline: string;
  summary: string;
  location: string;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    period: string;
    grade: string;
  }>;
  skills: string[];
  experience: Array<{
    role: string;
    organization: string;
    period: string;
    type: string;
    highlights: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  verifiedCredentials: Array<{
    title: string;
    issuer: string;
    issuedAt: string;
    verificationHash: string;
  }>;
}

export const DEMO_RESUME_AARAV: DemoResume = {
  userId: "demo-talent",
  name: "Aarav Sharma",
  title: "Software Engineer / AI Developer",
  headline: "Full-Stack Software Engineer & AI Systems Developer | B.Tech CS",
  summary:
    "Student developer and open-source contributor with hands-on experience building high-throughput web applications and AI agent workflows. Strong competencies in React, Next.js App Router, TypeScript, Python FastAPI, and PostgreSQL. Seeking software engineering internships and entry-level developer roles.",
  location: "Bengaluru, Karnataka, India",
  education: [
    {
      institution: "Bangalore Institute of Technology",
      degree: "Bachelor of Technology",
      field: "Computer Science and Engineering",
      period: "2022 – 2026",
      grade: "8.9 / 10.0 CGPA",
    },
  ],
  skills: [
    "React",
    "Next.js",
    "TypeScript",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Machine Learning",
    "Tailwind CSS",
    "Docker",
    "Git / GitHub Actions",
    "REST & Streaming APIs",
  ],
  experience: [
    {
      role: "Open Source Contributor & Core Developer",
      organization: "AI Career Copilot",
      period: "2025 – Present",
      type: "Project",
      highlights: [
        "Architected vector similarity matching engine using ESCO taxonomies and cosine distance.",
        "Built responsive client interface with Next.js 15, React Server Components, and Tailwind CSS.",
        "Reduced token compaction latency by 45% using streaming buffers and Redis caching.",
      ],
    },
    {
      role: "Student Software Developer",
      organization: "Campus Opportunity Engine",
      period: "2024 – 2025",
      type: "Open Source",
      highlights: [
        "Implemented secure JWT/Supabase SSR authentication with RBAC authorization matrices.",
        "Created verifiable proof-of-work submission rubrics with automated SHA-256 hash validation.",
      ],
    },
  ],
  projects: [
    {
      title: "AI Career Copilot",
      description: "Autonomous career guidance and verified deliverable scoring platform for Indian engineering students.",
      technologies: ["Next.js", "TypeScript", "Python", "FastAPI", "Vector DB"],
      link: "https://github.com/demo_talent/ai-career-copilot",
    },
    {
      title: "Verifiable Credential Issuer",
      description: "Cryptographic proof-of-work protocol verifying PR complexity and issuing tamper-proof badges.",
      technologies: ["TypeScript", "PostgreSQL", "Prisma", "Docker"],
      link: "https://github.com/demo_talent/verifiable-credential-issuer",
    },
  ],
  verifiedCredentials: [
    {
      title: "Built Scalable RPC Cache Engine",
      issuer: "Astra Digital Technologies",
      issuedAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      verificationHash: "0x8f2c31e9a4d7b290c411a01b7e28d9c5...",
    },
    {
      title: "Production Next.js App Router Refactor",
      issuer: "Orbit Open Source",
      issuedAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
      verificationHash: "0x4b71e892cf38a192b192e409c211f4a9...",
    },
  ],
};
