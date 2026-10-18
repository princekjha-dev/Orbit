/**
 * Orbit Offline / Zero-Config Demo Mode Datasets
 *
 * Provides rich, realistic, coherent synthetic Indian mock data for each of the 7 Orbit roles
 * when running without an active PostgreSQL or Supabase instance, or during offline demonstration.
 *
 * All records represent synthetic demo personas and fictional Indian organizations only.
 */

import { inMemoryStore } from "@/lib/database/in-memory-store";

export function getTalentMockData() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Read applications from inMemoryStore if present so status changes reflect dynamically
  const appFrontend = inMemoryStore.applications?.get("demo-app-aarav-frontend") ||
    inMemoryStore.applications?.get("demo-opp-frontend-intern:demo-talent");
  const appAi = inMemoryStore.applications?.get("demo-app-aarav-ai") ||
    inMemoryStore.applications?.get("demo-opp-ai-intern:demo-talent");

  return {
    applications: [
      {
        id: appFrontend?.id || "demo-app-aarav-frontend",
        status: appFrontend?.status || "SHORTLISTED",
        appliedAt: yesterday,
        updatedAt: now,
        opportunity: {
          id: "demo-opp-frontend-intern",
          title: "Frontend Engineer Intern",
          type: "INTERNSHIP",
          organization: { name: "Nexora Labs", slug: "nexora-labs" },
          location: "Bengaluru, Karnataka (Hybrid)",
          compensation: "₹4 LPA – ₹6 LPA",
        },
      },
      {
        id: appAi?.id || "demo-app-aarav-ai",
        status: appAi?.status || "UNDER_REVIEW",
        appliedAt: yesterday,
        updatedAt: yesterday,
        opportunity: {
          id: "demo-opp-ai-intern",
          title: "AI Engineering Intern",
          type: "INTERNSHIP",
          organization: { name: "Nexora Labs", slug: "nexora-labs" },
          location: "Remote (India)",
          compensation: "₹5 LPA – ₹8 LPA",
        },
      },
    ],
    savedOpps: [
      {
        id: "mock-saved-1",
        savedAt: yesterday,
        opportunity: {
          id: "demo-opp-fullstack-dev",
          title: "Full Stack Developer",
          type: "JOB",
          organization: { name: "Astra Digital Technologies", slug: "astra-digital" },
          location: "Pune / Remote",
          compensation: "₹10 LPA – ₹16 LPA",
        },
      },
      {
        id: "mock-saved-2",
        savedAt: yesterday,
        opportunity: {
          id: "demo-opp-ml-engineer",
          title: "Machine Learning Engineer",
          type: "JOB",
          organization: { name: "Orbit Research Labs", slug: "orbit-research-labs" },
          location: "Hyderabad",
          compensation: "₹12 LPA – ₹20 LPA",
        },
      },
    ],
    activeProjects: [
      {
        id: "mock-proj-app-1",
        status: "ACCEPTED",
        project: {
          id: "demo-proj-career-copilot",
          title: "AI Career Copilot",
          organization: { name: "Aarav Sharma & Orbit Labs" },
          location: "Bengaluru",
        },
      },
    ],
    upcomingEvents: [
      {
        id: "demo-ev-ai-meetup",
        title: "India AI Builders Meetup",
        type: "MEETUP",
        startDate: nextWeek,
        location: "Koramangala, Bengaluru, Karnataka",
        slug: "india-ai-builders-meetup-bengaluru",
      },
      {
        id: "demo-hack-buildathon",
        title: "Orbit India Buildathon 2026",
        type: "HACKATHON",
        startDate: nextWeek,
        location: "Online (Pan-India)",
        slug: "orbit-india-buildathon-2026",
      },
    ],
    mentorshipSessions: [
      {
        id: "mock-session-1",
        scheduledAt: tomorrow,
        status: "SCHEDULED",
        mentor: { name: "Dr. Ananya Iyer" },
        mentee: { name: "Aarav Sharma" },
        request: { topic: "Transitioning to Production AI Agent Pipelines & Proof of Work" },
      },
    ],
    verifiedWork: [
      {
        id: "mock-work-1",
        title: "Built Scalable RPC Cache Engine",
        organizationName: "Astra Digital Technologies",
        completionDate: yesterday,
        verificationHash: "0x8f2c31e9a4d7b290...",
      },
      {
        id: "mock-work-2",
        title: "Production Next.js App Router Refactor",
        organizationName: "Orbit Open Source",
        completionDate: yesterday,
        verificationHash: "0x4b71e892cf38a192...",
      },
    ],
    skillEvidence: [
      {
        id: "mock-ev-1",
        skillName: "Next.js",
        evidenceType: "GITHUB_COMMIT",
        proofUrl: "https://github.com/demo_talent/orbit-engine",
        createdAt: yesterday,
      },
      {
        id: "mock-ev-2",
        skillName: "TypeScript",
        evidenceType: "PULL_REQUEST",
        proofUrl: "https://github.com/demo_talent/orbit-core/pull/42",
        createdAt: yesterday,
      },
      {
        id: "mock-ev-3",
        skillName: "FastAPI",
        evidenceType: "VERIFIED_DELIVERABLE",
        proofUrl: "https://orbit.demo/evidence/fastapi-vector-cache",
        createdAt: yesterday,
      },
    ],
  };
}

export function getFounderMockData() {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    startups: [
      {
        id: "demo-startup-nexora",
        name: "Nexora Labs",
        slug: "nexora-labs",
        pitch: "Autonomous workflow orchestration and verifiable cloud pipelines for enterprise teams.",
        logoUrl: null,
        milestones: [
          { id: "m-1", title: "Complete v1.0 Pilot Architecture", dueDate: nextMonth, status: "IN_PROGRESS" },
          { id: "m-2", title: "Deploy Security & RLS Enforcement Layer", dueDate: nextMonth, status: "COMPLETED" },
          { id: "m-3", title: "Onboard First 5 Enterprise Design Partners in Bengaluru", dueDate: nextMonth, status: "PENDING" },
        ],
        hiringNeeds: [
          { id: "h-1", title: "Frontend Engineer Intern", roleType: "INTERNSHIP", count: 1 },
          { id: "h-2", title: "AI Engineering Intern", roleType: "INTERNSHIP", count: 1 },
        ],
        _count: { members: 3, milestones: 3, tasks: 8 },
      },
    ],
    orgMemberships: [
      {
        organization: {
          id: "demo-org-nexora",
          name: "Nexora Labs",
          slug: "nexora-labs",
          opportunities: [
            {
              id: "demo-opp-frontend-intern",
              title: "Frontend Engineer Intern",
              type: "INTERNSHIP",
              _count: { applications: 7 },
              createdAt: now,
            },
            {
              id: "demo-opp-ai-intern",
              title: "AI Engineering Intern",
              type: "INTERNSHIP",
              _count: { applications: 12 },
              createdAt: now,
            },
            {
              id: "demo-opp-growth-intern",
              title: "Growth Intern",
              type: "INTERNSHIP",
              _count: { applications: 5 },
              createdAt: now,
            },
          ],
          projects: [
            {
              id: "demo-proj-startup-workspace",
              title: "Startup Validation Workspace",
              _count: { applications: 3 },
            },
          ],
        },
      },
    ],
    collabRequests: [
      {
        id: "mock-collab-1",
        title: "Enterprise Architecture & Distribution Advisory",
        status: "PROPOSED",
        sender: {
          id: "sender-1",
          name: "Vikram Malhotra",
          username: "demo_org_admin",
          image: null,
        },
      },
      {
        id: "mock-collab-2",
        title: "AI Agent Evaluation & Thesis Validation",
        status: "PROPOSED",
        sender: {
          id: "sender-2",
          name: "Dr. Ananya Iyer",
          username: "demo_mentor",
          image: null,
        },
      },
    ],
    candidateApps: [
      {
        id: "demo-app-aarav-frontend",
        status: inMemoryStore.applications?.get("demo-app-aarav-frontend")?.status || "SHORTLISTED",
        appliedAt: now,
        opportunity: { title: "Frontend Engineer Intern" },
        user: { name: "Aarav Sharma", email: "demo.talent@orbit.demo", username: "demo_talent" },
      },
      {
        id: "demo-app-aarav-ai",
        status: inMemoryStore.applications?.get("demo-app-aarav-ai")?.status || "UNDER_REVIEW",
        appliedAt: now,
        opportunity: { title: "AI Engineering Intern" },
        user: { name: "Aarav Sharma", email: "demo.talent@orbit.demo", username: "demo_talent" },
      },
    ],
  };
}

export function getRecruiterMockData() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Dynamic applications from inMemoryStore
  const dynamicApps = Array.from(inMemoryStore.applications?.values() || []);
  const astraApps = dynamicApps.length > 0 ? dynamicApps : [
    {
      id: "demo-app-astra-1",
      status: "INTERVIEW",
      appliedAt: now,
      opportunityId: "demo-opp-fullstack-dev",
      opportunityTitle: "Full Stack Developer",
      candidateName: "Rohan Kulkarni",
      candidateUsername: "rohan_k",
      candidateEmail: "rohan.kulkarni@demo.orbit",
      candidateHeadline: "Senior Backend & Next.js Engineer (Pune)",
    },
    {
      id: "demo-app-astra-2",
      status: "SELECTED",
      appliedAt: yesterday,
      opportunityId: "demo-opp-product-designer",
      opportunityTitle: "Product Designer",
      candidateName: "Priya Nambiar",
      candidateUsername: "priya_n",
      candidateEmail: "priya.nambiar@demo.orbit",
      candidateHeadline: "Lead Systems & UI/UX Designer (Gurugram)",
    },
    {
      id: "demo-app-astra-3",
      status: "APPLIED",
      appliedAt: now,
      opportunityId: "demo-opp-fullstack-dev",
      opportunityTitle: "Full Stack Developer",
      candidateName: "Ankit Roy",
      candidateUsername: "ankit_r",
      candidateEmail: "ankit.roy@demo.orbit",
      candidateHeadline: "Full Stack Developer | Node.js & React (Kolkata)",
    },
    {
      id: "demo-app-astra-4",
      status: "UNDER_REVIEW",
      appliedAt: yesterday,
      opportunityId: "demo-opp-product-designer",
      opportunityTitle: "Product Designer",
      candidateName: "Sneha Sen",
      candidateUsername: "sneha_s",
      candidateEmail: "sneha.sen@demo.orbit",
      candidateHeadline: "Product Designer & Design Systems Advocate (Delhi NCR)",
    },
    {
      id: "demo-app-astra-5",
      status: "REJECTED",
      appliedAt: yesterday,
      opportunityId: "demo-opp-fullstack-dev",
      opportunityTitle: "Full Stack Developer",
      candidateName: "Devansh Patel",
      candidateUsername: "devansh_p",
      candidateEmail: "devansh.patel@demo.orbit",
      candidateHeadline: "Junior Web Developer (Ahmedabad)",
    },
  ];

  return {
    orgMemberships: [
      {
        organization: {
          id: "demo-org-astra",
          name: "Astra Digital Technologies",
          slug: "astra-digital",
          opportunities: [
            { id: "demo-opp-fullstack-dev", title: "Full Stack Developer", _count: { applications: 18 } },
            { id: "demo-opp-product-designer", title: "Product Designer", _count: { applications: 12 } },
          ],
          talentPools: [
            { id: "tp-1", name: "High-Evidence Full-Stack Engineers", _count: { candidates: 24 } },
            { id: "tp-2", name: "Verified Next.js & React Talent", _count: { candidates: 19 } },
          ],
          candidateShortlists: [
            {
              id: "sl-1",
              name: "Priority Candidates - Q4 Bengaluru/Pune",
              candidates: [
                { id: "c-1", notes: [{ id: "n-1", content: "Strong GitHub verification and PR quality." }] },
                { id: "c-2", notes: [{ id: "n-2", content: "Demonstrated production Next.js experience." }] },
              ],
            },
          ],
        },
      },
    ],
    applications: astraApps.map((a: any) => ({
      id: a.id,
      status: a.status,
      appliedAt: a.appliedAt || now,
      opportunity: {
        id: a.opportunityId || "demo-opp-fullstack-dev",
        title: a.opportunityTitle || "Engineering Opening",
      },
      user: {
        id: a.userId || a.id,
        name: a.candidateName || a.user?.name || "Candidate",
        username: a.candidateUsername || a.user?.username || "candidate",
        email: a.candidateEmail || a.user?.email || "candidate@demo.orbit",
        profile: {
          headline: a.candidateHeadline || a.user?.profile?.headline || "Software Engineer",
          location: a.candidateLocation || a.user?.profile?.location || "India",
        },
        verifiedWorkRecords: [
          { id: "w-1", title: "Built Scalable RPC Cache Engine", organizationName: "Astra Digital Technologies" },
        ],
      },
    })),
    verifiedProofs: [
      {
        id: "proof-1",
        title: "Built Scalable RPC Cache Engine",
        user: { name: "Aarav Sharma", username: "demo_talent" },
        completionDate: yesterday,
      },
      {
        id: "proof-2",
        title: "Production DB Migration & Query Optimization",
        user: { name: "Rohan Kulkarni", username: "rohan_k" },
        completionDate: yesterday,
      },
    ],
  };
}

export function getMentorMockData() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  return {
    profile: {
      id: "mock-mentor-prof-1",
      headline: "AI Product & Startup Mentor | Distinguished Systems Advisor",
      expertiseAreas: [
        "Artificial Intelligence",
        "Product Strategy",
        "Startup Validation",
        "Machine Learning",
        "Career Development",
        "Technical Leadership",
      ],
      isVerified: true,
      totalSessions: 42,
      rating: 4.98,
    },
    sessions: [
      {
        id: "s-1",
        scheduledAt: tomorrow,
        status: "SCHEDULED",
        mentee: { id: "demo-talent", name: "Aarav Sharma", username: "demo_talent", email: "demo.talent@orbit.demo" },
        request: {
          topic: "Transitioning to Production AI Agent Pipelines & Proof of Work",
          goals: "Review state synchronization architecture for high-concurrency event stream in AI Career Copilot.",
        },
      },
      {
        id: "s-2",
        scheduledAt: nextWeek,
        status: "SCHEDULED",
        mentee: { id: "demo-founder", name: "Riya Mehta", username: "demo_founder", email: "demo.founder@orbit.demo" },
        request: {
          topic: "Pre-Seed Architecture Validation & Founding Engineer Hiring Rubrics",
          goals: "Structure founding engineering job specs and technical vetting process for Nexora Labs.",
        },
      },
    ],
    requests: [
      {
        id: "req-1",
        status: "REQUESTED",
        mentee: { id: "m-3", name: "Priya Nambiar", username: "priya_n", email: "priya@demo.orbit" },
      },
      {
        id: "req-2",
        status: "REQUESTED",
        mentee: { id: "demo-recruiter", name: "Karan Verma", username: "demo_recruiter", email: "demo.recruiter@orbit.demo" },
      },
    ],
    communities: [
      {
        community: {
          id: "demo-comm-ai-builders",
          name: "AI Builders India",
          slug: "ai-builders-india",
          category: "AI",
        },
      },
      {
        community: {
          id: "demo-comm-women-in-product",
          name: "Women in Product India",
          slug: "women-in-product-india",
          category: "PRODUCT",
        },
      },
    ],
  };
}

export function getOrganizationMockData() {
  const now = new Date();

  return {
    memberships: [
      {
        organization: {
          id: "demo-org-astra",
          name: "Astra Digital Technologies",
          slug: "astra-digital",
          verification: {
            id: "ver-1",
            status: "VERIFIED",
            verifiedAt: now,
          },
          members: [
            { user: { id: "demo-organization", name: "Vikram Malhotra", email: "demo.organization@orbit.demo", role: "ADMIN" } },
            { user: { id: "demo-recruiter", name: "Karan Verma", email: "demo.recruiter@orbit.demo", role: "MEMBER" } },
            { user: { id: "demo-talent", name: "Aarav Sharma", email: "demo.talent@orbit.demo", role: "MEMBER" } },
          ],
          opportunities: [
            {
              id: "demo-opp-fullstack-dev",
              title: "Full Stack Developer",
              createdAt: now,
              _count: { applications: 18 },
            },
            {
              id: "demo-opp-product-designer",
              title: "Product Designer",
              createdAt: now,
              _count: { applications: 12 },
            },
          ],
          projects: [
            {
              id: "demo-proj-bharat-commerce",
              title: "Bharat Local Commerce Platform",
              _count: { applications: 4 },
            },
            {
              id: "demo-proj-oss-analytics",
              title: "Open Source Developer Analytics",
              _count: { applications: 6 },
            },
          ],
          talentPools: [
            { id: "pool-1", name: "High-Evidence Engineers (Pune / Bengaluru)", _count: { candidates: 24 } },
            { id: "pool-2", name: "Fast-Track Intern Pipeline", _count: { candidates: 15 } },
          ],
        },
      },
    ],
  };
}

export function getOrganizerMockData() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);

  return {
    communities: [
      {
        id: "demo-comm-student-developers",
        name: "Student Developers India",
        slug: "student-developers-india",
        _count: { members: 680, posts: 112 },
        posts: [
          { id: "p-1", title: "Orbit India Buildathon 2026 registration is live! Total prize pool ₹1,75,000", createdAt: now },
          { id: "p-2", title: "Mentorship office hours open for student project submissions", createdAt: now },
        ],
      },
      {
        id: "demo-comm-ai-builders",
        name: "AI Builders India",
        slug: "ai-builders-india",
        _count: { members: 428, posts: 64 },
        posts: [
          { id: "p-3", title: "Evaluating LLM Agent Latency: Best practices for production SaaS", createdAt: now },
        ],
      },
    ],
    events: [
      {
        id: "demo-ev-ai-meetup",
        title: "India AI Builders Meetup",
        startDate: nextWeek,
        _count: { registrations: 164 },
      },
      {
        id: "demo-ev-dev-day",
        title: "Developer Community Day",
        startDate: nextMonth,
        _count: { registrations: 215 },
      },
    ],
    hackathons: [
      {
        id: "demo-hack-buildathon",
        title: "Orbit India Buildathon 2026",
        startDate: nextWeek,
        _count: { registrations: 384 },
      },
    ],
  };
}

export function getPlatformAdminMockData() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return {
    userCount: 1420,
    orgCount: 68,
    pendingVerifications: [
      {
        id: "ver-1",
        status: "PENDING",
        organization: { name: "Nexora Labs", slug: "nexora-labs" },
      },
      {
        id: "ver-2",
        status: "PENDING",
        organization: { name: "Astra Digital Technologies", slug: "astra-digital" },
      },
      {
        id: "ver-3",
        status: "PENDING",
        organization: { name: "Orbit Research Labs", slug: "orbit-research-labs" },
      },
    ],
    openReports: [
      {
        id: "rep-1",
        reason: "Duplicate project listing detected",
        status: "OPEN",
        createdAt: yesterday,
      },
      {
        id: "rep-2",
        reason: "Inquiry on proof-of-work link authenticity",
        status: "OPEN",
        createdAt: now,
      },
    ],
    openDisputes: [
      {
        id: "disp-1",
        title: "Milestone deliverable verification inquiry",
        status: "OPEN",
      },
    ],
    recentAuditLogs: [
      {
        id: "log-1",
        action: "ORGANIZATION_VERIFY_REQUEST",
        createdAt: now,
        actor: { name: "Vikram Malhotra", email: "demo.organization@orbit.demo" },
      },
      {
        id: "log-2",
        action: "USER_ROLE_ELEVATED",
        createdAt: yesterday,
        actor: { name: "Aditya Rao", email: "demo.admin@orbit.demo" },
      },
      {
        id: "log-3",
        action: "HACKATHON_EVENT_PUBLISHED",
        createdAt: yesterday,
        actor: { name: "Neha Kapoor", email: "demo.organizer@orbit.demo" },
      },
    ],
  };
}
