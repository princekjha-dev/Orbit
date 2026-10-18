import { DEMO_ORGANIZATIONS } from "./demo-organizations";

export interface DemoEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  organizationId: string;
  organization: {
    name: string;
    slug: string;
  };
  location: string;
  city: string;
  format: "ONLINE" | "HYBRID" | "ONSITE";
  startDate: string;
  endDate: string;
  registrationsCount: number;
}

const now = Date.now();

export const DEMO_EVENTS: DemoEvent[] = [
  {
    id: "demo-ev-ai-meetup",
    title: "India AI Builders Meetup",
    slug: "india-ai-builders-meetup-bengaluru",
    description:
      "A hands-on technical gathering of LLM engineers, AI researchers, and agentic framework developers in Bengaluru. Sessions on tool-calling evaluation, local small models, and multi-tenant vector indexes.",
    organizationId: DEMO_ORGANIZATIONS.ibn.id,
    organization: {
      name: DEMO_ORGANIZATIONS.ibn.name,
      slug: DEMO_ORGANIZATIONS.ibn.slug,
    },
    location: "Koramangala, Bengaluru, Karnataka",
    city: "Bengaluru",
    format: "HYBRID",
    startDate: new Date(now + 3600000 * 24 * 12).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 12 + 3600000 * 4).toISOString(),
    registrationsCount: 164,
  },
  {
    id: "demo-ev-startup-systems",
    title: "Startup Systems Night",
    slug: "startup-systems-night-gurugram",
    description:
      "Deep dive into high-scale distributed systems, state synchronization, and zero-downtime database migrations with engineering leads from Astra Digital Technologies.",
    organizationId: DEMO_ORGANIZATIONS.astra.id,
    organization: {
      name: DEMO_ORGANIZATIONS.astra.name,
      slug: DEMO_ORGANIZATIONS.astra.slug,
    },
    location: "Cyber City, Gurugram, Haryana",
    city: "Gurugram",
    format: "ONSITE",
    startDate: new Date(now + 3600000 * 24 * 18).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 18 + 3600000 * 3).toISOString(),
    registrationsCount: 98,
  },
  {
    id: "demo-ev-product-builders",
    title: "Product Builders India",
    slug: "product-builders-india-mumbai",
    description:
      "Interactive workshop and demo showcase featuring pre-seed founders and product designers in Mumbai. Exploring UI craftsmanship, micro-animations, and fast product-market validation.",
    organizationId: DEMO_ORGANIZATIONS.nexora.id,
    organization: {
      name: DEMO_ORGANIZATIONS.nexora.name,
      slug: DEMO_ORGANIZATIONS.nexora.slug,
    },
    location: "Bandra Kurla Complex (BKC), Mumbai, Maharashtra",
    city: "Mumbai",
    format: "ONSITE",
    startDate: new Date(now + 3600000 * 24 * 22).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 22 + 3600000 * 4).toISOString(),
    registrationsCount: 142,
  },
  {
    id: "demo-ev-ai-founders",
    title: "AI Founders Meetup",
    slug: "ai-founders-meetup-hyderabad",
    description:
      "Closed-door roundtable for technical founders in Hyderabad building foundation models, enterprise AI agents, and verifiable computational benchmarks.",
    organizationId: DEMO_ORGANIZATIONS.orbitLabs.id,
    organization: {
      name: DEMO_ORGANIZATIONS.orbitLabs.name,
      slug: DEMO_ORGANIZATIONS.orbitLabs.slug,
    },
    location: "HITEC City, Hyderabad, Telangana",
    city: "Hyderabad",
    format: "ONSITE",
    startDate: new Date(now + 3600000 * 24 * 26).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 26 + 3600000 * 3).toISOString(),
    registrationsCount: 76,
  },
  {
    id: "demo-ev-dev-day",
    title: "Developer Community Day",
    slug: "developer-community-day-pune",
    description:
      "Collaborative day of open-source hack hours, mentor lightning talks, and developer portfolio clinics organized by India Builders Network.",
    organizationId: DEMO_ORGANIZATIONS.ibn.id,
    organization: {
      name: DEMO_ORGANIZATIONS.ibn.name,
      slug: DEMO_ORGANIZATIONS.ibn.slug,
    },
    location: "Baner, Pune, Maharashtra",
    city: "Pune",
    format: "HYBRID",
    startDate: new Date(now + 3600000 * 24 * 30).toISOString(),
    endDate: new Date(now + 3600000 * 24 * 30 + 3600000 * 6).toISOString(),
    registrationsCount: 215,
  },
];
