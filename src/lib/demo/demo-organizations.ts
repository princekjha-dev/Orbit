export interface DemoOrganization {
  id: string;
  name: string;
  slug: string;
  domain: string;
  industry: string;
  description: string;
  location: string;
  website: string;
  verificationStatus: "VERIFIED" | "PENDING" | "UNVERIFIED";
  verifiedAt?: string;
  logoUrl?: string | null;
  adminUserId: string;
}

export const DEMO_ORGANIZATIONS: Record<string, DemoOrganization> = {
  nexora: {
    id: "demo-org-nexora",
    name: "Nexora Labs",
    slug: "nexora-labs",
    domain: "nexoralabs.ai",
    industry: "AI / SaaS",
    description: "Autonomous workflow orchestration and verifiable cloud pipelines for modern product teams.",
    location: "Mumbai & Bengaluru, India",
    website: "https://nexoralabs.ai",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    adminUserId: "demo-founder",
  },
  astra: {
    id: "demo-org-astra",
    name: "Astra Digital Technologies",
    slug: "astra-digital",
    domain: "astradigital.in",
    industry: "Enterprise Software & Cloud Platforms",
    description: "Next-generation distributed infrastructure, cloud migration accelerators, and enterprise design engineering.",
    location: "Gurugram & Pune, India",
    website: "https://astradigital.in",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date(Date.now() - 3600000 * 24 * 90).toISOString(),
    adminUserId: "demo-organization",
  },
  ibn: {
    id: "demo-org-ibn",
    name: "India Builders Network",
    slug: "india-builders-network",
    domain: "indiabuilders.network",
    industry: "Developer Community & Hackathons",
    description: "National builder ecosystem driving hackathons, open-source sprints, and student developer growth across India.",
    location: "Noida, Uttar Pradesh, India",
    website: "https://indiabuilders.network",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date(Date.now() - 3600000 * 24 * 120).toISOString(),
    adminUserId: "demo-organizer",
  },
  orbitLabs: {
    id: "demo-org-orbit-labs",
    name: "Orbit Research Labs",
    slug: "orbit-research-labs",
    domain: "orbitresearch.in",
    industry: "AI & Machine Learning Research",
    description: "Advanced generative model evaluation, cryptographic verification standards, and reproducible ML benchmarks.",
    location: "Hyderabad, Telangana, India",
    website: "https://orbitresearch.in",
    verificationStatus: "VERIFIED",
    verifiedAt: new Date(Date.now() - 3600000 * 24 * 45).toISOString(),
    adminUserId: "demo-admin",
  },
};
