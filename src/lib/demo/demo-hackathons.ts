import { DEMO_ORGANIZATIONS } from "./demo-organizations";

export interface DemoHackathon {
  id: string;
  title: string;
  slug: string;
  description: string;
  organizer: string;
  organizationId: string;
  location: string;
  format: "ONLINE" | "HYBRID" | "ONSITE";
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  prizes: {
    total: string;
    first: string;
    second: string;
    third: string;
  };
  tracks: string[];
  participantsCount: number;
  teamsCount: number;
}

const now = Date.now();

export const DEMO_HACKATHONS: DemoHackathon[] = [
  {
    id: "demo-hack-buildathon",
    title: "Orbit India Buildathon 2026",
    slug: "orbit-india-buildathon-2026",
    description:
      "India's premier digital buildathon bringing together 500+ builders, engineers, and designers to build production-ready AI coworkers, verifiable developer tools, and high-performance web systems.",
    organizer: DEMO_ORGANIZATIONS.ibn.name,
    organizationId: DEMO_ORGANIZATIONS.ibn.id,
    location: "Online (Pan-India)",
    format: "ONLINE",
    startDate: new Date(now + 3600000 * 24 * 10).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 13).toISOString(),
    registrationDeadline: new Date(now + 3600000 * 24 * 8).toISOString(),
    prizes: {
      total: "₹1,75,000",
      first: "₹1,00,000",
      second: "₹50,000",
      third: "₹25,000",
    },
    tracks: [
      "Autonomous Coworkers & AI Agents",
      "Verifiable Proof-of-Work Tooling",
      "High-Performance Next.js Architectures",
    ],
    participantsCount: 384,
    teamsCount: 92,
  },
  {
    id: "demo-hack-bengaluru-ai",
    title: "Bengaluru AI Hack",
    slug: "bengaluru-ai-hack",
    description:
      "48-hour competitive sprint in India's tech capital. Build multi-agent workflows, local SLM inference apps, and developer productivity plugins.",
    organizer: DEMO_ORGANIZATIONS.nexora.name,
    organizationId: DEMO_ORGANIZATIONS.nexora.id,
    location: "Koramangala, Bengaluru, Karnataka",
    format: "HYBRID",
    startDate: new Date(now + 3600000 * 24 * 20).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 22).toISOString(),
    registrationDeadline: new Date(now + 3600000 * 24 * 17).toISOString(),
    prizes: {
      total: "₹1,35,000",
      first: "₹75,000",
      second: "₹40,000",
      third: "₹20,000",
    },
    tracks: [
      "Agent Tool-Calling & Context Optimization",
      "Multilingual Indic Language AI",
      "Enterprise Workflow Automation",
    ],
    participantsCount: 240,
    teamsCount: 58,
  },
  {
    id: "demo-hack-student-challenge",
    title: "India Student Startup Challenge",
    slug: "india-student-startup-challenge",
    description:
      "National university startup hackathon challenging student engineers to turn validated prototypes into viable ventures with verifiable traction metrics.",
    organizer: DEMO_ORGANIZATIONS.ibn.name,
    organizationId: DEMO_ORGANIZATIONS.ibn.id,
    location: "New Delhi (Hybrid)",
    format: "HYBRID",
    startDate: new Date(now + 3600000 * 24 * 35).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 37).toISOString(),
    registrationDeadline: new Date(now + 3600000 * 24 * 30).toISOString(),
    prizes: {
      total: "₹1,50,000",
      first: "₹1,00,000",
      second: "₹50,000",
      third: "Mentorship & Cloud Credits",
    },
    tracks: [
      "Campus Opportunities & EdTech",
      "Open Data & Public Digital Infrastructure",
      "Developer Micro-SaaS",
    ],
    participantsCount: 310,
    teamsCount: 74,
  },
  {
    id: "demo-hack-build-bharat",
    title: "Build for Bharat Hackathon",
    slug: "build-for-bharat-hackathon",
    description:
      "Crafting next-generation software for India's 65 million MSMEs, regional commerce networks, and digital public goods.",
    organizer: DEMO_ORGANIZATIONS.astra.name,
    organizationId: DEMO_ORGANIZATIONS.astra.id,
    location: "HITEC City, Hyderabad, Telangana",
    format: "ONSITE",
    startDate: new Date(now + 3600000 * 24 * 45).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 47).toISOString(),
    registrationDeadline: new Date(now + 3600000 * 24 * 40).toISOString(),
    prizes: {
      total: "₹2,10,000",
      first: "₹1,20,000",
      second: "₹60,000",
      third: "₹30,000",
    },
    tracks: [
      "Open Network Digital Commerce (ONDC)",
      "FinTech & UPI Billing Microservices",
      "Localized Supply Chain Visibility",
    ],
    participantsCount: 290,
    teamsCount: 68,
  },
];
