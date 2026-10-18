import { OrbitRole } from "@/lib/auth/roles";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  username: string;
  role: OrbitRole;
  title: string;
  headline: string;
  bio: string;
  location: string;
  city: string;
  state: string;
  country: string;
  avatarUrl?: string;
  badge: string;
  age?: number;
  education?: string;
  skills: string[];
  lookingFor?: string;
  workModePreference?: string;
  organizationName?: string;
  organizationSlug?: string;
  startupName?: string;
  startupIndustry?: string;
  startupStage?: string;
  expertise?: string[];
}

export const DEMO_USERS: Record<OrbitRole, DemoUser> = {
  TALENT: {
    id: "demo-talent",
    email: "demo.talent@orbit.demo",
    name: "Aarav Sharma",
    username: "demo_talent",
    role: "TALENT",
    title: "Software Engineer / AI Developer",
    headline: "Full-Stack Software Engineer & AI Systems Developer | B.Tech CS",
    bio: "21-year-old developer and open-source contributor passionate about building high-performance web applications and autonomous AI agents. Experienced with React, Next.js, TypeScript, Python, and Machine Learning.",
    location: "Bengaluru, Karnataka, India",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    badge: "Talent",
    age: 21,
    education: "B.Tech Computer Science, Bangalore Institute of Technology",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Python",
      "AI/ML",
      "FastAPI",
      "PostgreSQL",
      "Tailwind CSS",
      "Docker",
    ],
    lookingFor: "Internships and entry-level software roles",
    workModePreference: "Remote / Hybrid",
  },

  FOUNDER: {
    id: "demo-founder",
    email: "demo.founder@orbit.demo",
    name: "Riya Mehta",
    username: "demo_founder",
    role: "FOUNDER",
    title: "Founder & CEO at Nexora Labs",
    headline: "Founder at Nexora Labs | Building AI/SaaS Orchestration Workflows",
    bio: "Pre-seed founder accelerating developer workflows with autonomous AI agents. Passionate about developer tooling, scalable Next.js systems, and assembling high-signal founding teams.",
    location: "Mumbai, Maharashtra, India",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    badge: "Founder",
    startupName: "Nexora Labs",
    startupIndustry: "AI / SaaS",
    startupStage: "Pre-Seed",
    skills: ["Product Strategy", "AI Systems", "Next.js", "Team Building", "Go-To-Market"],
  },

  RECRUITER: {
    id: "demo-recruiter",
    email: "demo.recruiter@orbit.demo",
    name: "Karan Verma",
    username: "demo_recruiter",
    role: "RECRUITER",
    title: "Technical Recruiter at Astra Digital Technologies",
    headline: "Head of Technical Talent at Astra Digital Technologies",
    bio: "Talent scout identifying evidence-backed engineering talent across India. Sourcing high-calibre full-stack, distributed systems, and AI developers based on verifiable proof-of-work.",
    location: "Gurugram, Haryana, India",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    badge: "Recruiter",
    organizationName: "Astra Digital Technologies",
    organizationSlug: "astra-digital",
    skills: ["Technical Sourcing", "Talent Pipelines", "Candidate Evaluation", "Engineering Hiring"],
  },

  MENTOR: {
    id: "demo-mentor",
    email: "demo.mentor@orbit.demo",
    name: "Dr. Ananya Iyer",
    username: "demo_mentor",
    role: "MENTOR",
    title: "AI Product & Startup Mentor",
    headline: "Distinguished AI Systems Advisor & Venture Mentor",
    bio: "Guiding early-stage builders, founders, and engineering candidates through technical validation, agent evaluation rubrics, and career transitions. Over a decade of machine learning and startup leadership.",
    location: "Chennai, Tamil Nadu, India",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    badge: "Mentor",
    skills: [
      "Artificial Intelligence",
      "Product Strategy",
      "Startup Validation",
      "Machine Learning",
      "Career Development",
      "Technical Leadership",
    ],
    expertise: [
      "Artificial Intelligence",
      "Product Strategy",
      "Startup Validation",
      "Machine Learning",
      "Career Development",
      "Technical Leadership",
    ],
  },

  ORGANIZATION_ADMIN: {
    id: "demo-organization",
    email: "demo.organization@orbit.demo",
    name: "Vikram Malhotra",
    username: "demo_org_admin",
    role: "ORGANIZATION_ADMIN",
    title: "Organization Admin & VP of Engineering",
    headline: "VP of Engineering & Ecosystem Lead at Astra Digital Technologies",
    bio: "Overseeing enterprise engineering teams, partner integrations, verifiable student project engagements, and corporate talent infrastructure at Astra Digital.",
    location: "Pune, Maharashtra, India",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    badge: "Org Admin",
    organizationName: "Astra Digital Technologies",
    organizationSlug: "astra-digital",
    skills: ["System Architecture", "Engineering Management", "Enterprise Platforms", "Credential Verification"],
  },

  COMMUNITY_ORGANIZER: {
    id: "demo-organizer",
    email: "demo.organizer@orbit.demo",
    name: "Neha Kapoor",
    username: "demo_organizer",
    role: "COMMUNITY_ORGANIZER",
    title: "Lead Community Organizer at India Builders Network",
    headline: "Ecosystem Builder & Hackathon Lead at India Builders Network",
    bio: "Catalyzing India's developer ecosystem by hosting national hackathons, builder meetups, and open-source sprints. Fostering university student talent and early-stage startup collaborations.",
    location: "Noida, Uttar Pradesh, India",
    city: "Noida",
    state: "Uttar Pradesh",
    country: "India",
    badge: "Organizer",
    organizationName: "India Builders Network",
    organizationSlug: "india-builders-network",
    skills: ["Community Management", "Hackathon Organization", "Developer Relations", "Ecosystem Growth"],
  },

  PLATFORM_ADMIN: {
    id: "demo-admin",
    email: "demo.admin@orbit.demo",
    name: "Aditya Rao",
    username: "demo_admin",
    role: "PLATFORM_ADMIN",
    title: "Orbit Platform Administrator",
    headline: "Trust, Safety & Ecosystem Operations Administrator",
    bio: "Monitoring platform health, reviewing domain verification DNS challenges, ensuring community guidelines adherence, and auditing synthetic demo operations.",
    location: "Hyderabad, Telangana, India",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    badge: "Admin",
    skills: ["Platform Moderation", "DNS Verification", "Trust & Safety", "Security Auditing", "Ecosystem Analytics"],
  },
};
