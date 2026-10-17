/**
 * Orbit Offline / Zero-Config Demo Mode Datasets
 *
 * Provides rich, realistic mock data for each of the 7 Orbit roles
 * when running without an active PostgreSQL or Supabase instance.
 */

export function getTalentMockData() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    applications: [
      {
        id: "mock-app-1",
        status: "SHORTLISTED",
        appliedAt: yesterday,
        updatedAt: now,
        opportunity: {
          id: "mock-opp-1",
          title: "Senior Full-Stack Engineer",
          type: "JOB",
          organization: { name: "Apex Innovations", slug: "apex-innovations" },
        },
      },
      {
        id: "mock-app-2",
        status: "UNDER_REVIEW",
        appliedAt: yesterday,
        updatedAt: yesterday,
        opportunity: {
          id: "mock-opp-2",
          title: "Frontend Systems Developer (React & Next.js)",
          type: "JOB",
          organization: { name: "RaftLabs Tech", slug: "raftlabs" },
        },
      },
      {
        id: "mock-app-3",
        status: "APPLIED",
        appliedAt: yesterday,
        updatedAt: yesterday,
        opportunity: {
          id: "mock-opp-3",
          title: "Distributed Systems & Cloud Architect",
          type: "STARTUP_ROLE",
          organization: { name: "Aether Dynamics", slug: "aether-dynamics" },
        },
      },
    ],
    savedOpps: [
      {
        id: "mock-saved-1",
        savedAt: yesterday,
        opportunity: {
          id: "mock-opp-4",
          title: "Lead Rust & Backend Infrastructure Engineer",
          type: "JOB",
          organization: { name: "Hyperion Protocol" },
        },
      },
      {
        id: "mock-saved-2",
        savedAt: yesterday,
        opportunity: {
          id: "mock-opp-5",
          title: "AI Workflows & Next.js Product Engineer",
          type: "PAID_PROJECT",
          organization: { name: "Kite Labs" },
        },
      },
    ],
    activeProjects: [
      {
        id: "mock-proj-app-1",
        status: "ACCEPTED",
        project: {
          id: "mock-proj-1",
          title: "Next.js 15 Migration & Real-Time Sync Engine",
          organization: { name: "Apex Innovations" },
        },
      },
    ],
    upcomingEvents: [
      {
        id: "mock-event-1",
        title: "Global Builder Hackathon 2026",
        type: "HACKATHON",
        startDate: nextWeek,
        location: "Virtual & Hybrid Hubs",
        slug: "global-builder-hackathon-2026",
      },
      {
        id: "mock-event-2",
        title: "Systems Architecture & Scalability Round Table",
        type: "WORKSHOP",
        startDate: nextWeek,
        location: "Orbit Stage A",
        slug: "systems-architecture-roundtable",
      },
    ],
    mentorshipSessions: [
      {
        id: "mock-session-1",
        scheduledAt: nextWeek,
        status: "SCHEDULED",
        mentor: { name: "Dr. Sofia Chen" },
        mentee: { name: "Alex Rivera" },
        request: { topic: "Distributed Systems & Production Architecture Review" },
      },
    ],
    verifiedWork: [
      {
        id: "mock-work-1",
        title: "Built Scalable RPC Cache Engine",
        organizationName: "Apex Innovations",
        completionDate: yesterday,
        verificationHash: "0x8f2c31e9a4d7b290...",
      },
      {
        id: "mock-work-2",
        title: "Production Next.js App Router Refactor",
        organizationName: "RaftLabs Tech",
        completionDate: yesterday,
        verificationHash: "0x4b71e892cf38a192...",
      },
    ],
    skillEvidence: [
      {
        id: "mock-ev-1",
        skillName: "Next.js",
        evidenceType: "GITHUB_COMMIT",
        proofUrl: "https://github.com/orbit/engine",
        createdAt: yesterday,
      },
      {
        id: "mock-ev-2",
        skillName: "TypeScript",
        evidenceType: "PULL_REQUEST",
        proofUrl: "https://github.com/orbit/core/pull/42",
        createdAt: yesterday,
      },
      {
        id: "mock-ev-3",
        skillName: "PostgreSQL",
        evidenceType: "VERIFIED_DELIVERABLE",
        proofUrl: "https://orbit.app/evidence/db-opt",
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
        id: "mock-startup-1",
        name: "Aether Dynamics",
        slug: "aether-dynamics",
        pitch: "Autonomous workflow orchestration and verifiable cloud pipelines for enterprise teams.",
        logoUrl: null,
        milestones: [
          { id: "m-1", title: "Complete v1.0 Pilot Architecture", dueDate: nextMonth, status: "IN_PROGRESS" },
          { id: "m-2", title: "Deploy Security & RLS Enforcement Layer", dueDate: nextMonth, status: "COMPLETED" },
          { id: "m-3", title: "Onboard First 5 Enterprise Design Partners", dueDate: nextMonth, status: "PENDING" },
        ],
        hiringNeeds: [
          { id: "h-1", title: "Founding Full-Stack Systems Engineer", roleType: "FULL_TIME", count: 1 },
          { id: "h-2", title: "Senior Cloud Infrastructure Engineer", roleType: "CONTRACT", count: 1 },
        ],
        _count: { members: 4, milestones: 3, tasks: 12 },
      },
    ],
    orgMemberships: [
      {
        organization: {
          id: "mock-org-1",
          name: "Aether Dynamics Inc.",
          slug: "aether-dynamics",
          opportunities: [
            {
              id: "mock-opp-1",
              title: "Founding Full-Stack Systems Engineer",
              type: "STARTUP_ROLE",
              _count: { applications: 7 },
              createdAt: now,
            },
            {
              id: "mock-opp-2",
              title: "AI Systems Research Intern",
              type: "INTERNSHIP",
              _count: { applications: 14 },
              createdAt: now,
            },
          ],
          projects: [
            {
              id: "mock-proj-1",
              title: "High-Throughput Streaming Pipeline Engine",
              _count: { applications: 4 },
            },
          ],
        },
      },
    ],
    collabRequests: [
      {
        id: "mock-collab-1",
        title: "Seed Stage Venture Advisory & Distribution Partnering",
        status: "PROPOSED",
        sender: {
          id: "sender-1",
          name: "David Sterling",
          username: "demo_org_admin",
          image: null,
        },
      },
      {
        id: "mock-collab-2",
        title: "Research Collaboration on Verifiable Systems",
        status: "PROPOSED",
        sender: {
          id: "sender-2",
          name: "Dr. Sofia Chen",
          username: "demo_mentor",
          image: null,
        },
      },
    ],
    candidateApps: [
      {
        id: "mock-c-1",
        status: "SHORTLISTED",
        appliedAt: now,
        opportunity: { title: "Founding Full-Stack Systems Engineer" },
        user: { name: "Alex Rivera", email: "demo.talent@orbit.demo", username: "demo_talent" },
      },
      {
        id: "mock-c-2",
        status: "APPLIED",
        appliedAt: now,
        opportunity: { title: "AI Systems Research Intern" },
        user: { name: "Priya Sharma", email: "priya@example.com", username: "priya_s" },
      },
    ],
  };
}

export function getRecruiterMockData() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return {
    orgMemberships: [
      {
        organization: {
          id: "mock-recruiter-org-1",
          name: "Apex Innovations",
          slug: "apex-innovations",
          opportunities: [
            { id: "o-1", title: "Senior Full-Stack Engineer", _count: { applications: 18 } },
            { id: "o-2", title: "Distributed Database Engineer", _count: { applications: 9 } },
            { id: "o-3", title: "Frontend Architecture Specialist", _count: { applications: 12 } },
          ],
          talentPools: [
            { id: "tp-1", name: "Top Systems Architects", _count: { candidates: 24 } },
            { id: "tp-2", name: "High-Evidence React Engineers", _count: { candidates: 19 } },
          ],
          candidateShortlists: [
            {
              id: "sl-1",
              name: "Priority Candidates - Q4",
              candidates: [
                { id: "c-1", notes: [{ id: "n-1", content: "Strong GitHub verification and PR quality." }] },
                { id: "c-2", notes: [{ id: "n-2", content: "Demonstrated production Next.js experience." }] },
              ],
            },
          ],
        },
      },
    ],
    applications: [
      {
        id: "app-1",
        status: "SHORTLISTED",
        appliedAt: now,
        opportunity: { id: "o-1", title: "Senior Full-Stack Engineer" },
        user: {
          id: "user-talent-1",
          name: "Alex Rivera",
          username: "demo_talent",
          email: "demo.talent@orbit.demo",
          profile: {
            headline: "Full-Stack Software Engineer & Open Source Contributor",
            location: "San Francisco, CA (Remote)",
          },
          verifiedWorkRecords: [
            { id: "w-1", title: "Built Scalable RPC Cache Engine", organizationName: "Apex Innovations" },
          ],
        },
      },
      {
        id: "app-2",
        status: "UNDER_REVIEW",
        appliedAt: yesterday,
        opportunity: { id: "o-2", title: "Distributed Database Engineer" },
        user: {
          id: "user-talent-2",
          name: "Karan Mehta",
          username: "karan_m",
          email: "karan@example.com",
          profile: {
            headline: "Backend & Distributed Systems Specialist",
            location: "Bengaluru, India (Remote)",
          },
          verifiedWorkRecords: [
            { id: "w-2", title: "Kafka Pipeline Optimization", organizationName: "DataFlow Systems" },
          ],
        },
      },
    ],
    verifiedProofs: [
      {
        id: "proof-1",
        title: "Built Scalable RPC Cache Engine",
        user: { name: "Alex Rivera", username: "demo_talent" },
        completionDate: yesterday,
      },
      {
        id: "proof-2",
        title: "Production DB Migration & Query Optimization",
        user: { name: "Arjun Sharma", username: "arjun_s" },
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
      headline: "Distinguished Systems Architect & Startup Advisor",
      expertiseAreas: ["Distributed Systems", "Cloud Infrastructure", "Scalable Next.js", "Startup Scaling"],
      isVerified: true,
      totalSessions: 38,
      rating: 4.95,
    },
    sessions: [
      {
        id: "s-1",
        scheduledAt: tomorrow,
        status: "SCHEDULED",
        mentee: { id: "m-1", name: "Alex Rivera", username: "demo_talent", email: "demo.talent@orbit.demo" },
        request: {
          topic: "Distributed Systems Architecture Review",
          goals: "Review state synchronization architecture for high-concurrency event stream.",
        },
      },
      {
        id: "s-2",
        scheduledAt: nextWeek,
        status: "SCHEDULED",
        mentee: { id: "m-2", name: "Elena Rostova", username: "demo_founder", email: "demo.founder@orbit.demo" },
        request: {
          topic: "Technical Roadmap & Founder Hiring Strategy",
          goals: "Structure founding engineering job specs and technical vetting process.",
        },
      },
    ],
    requests: [
      {
        id: "req-1",
        status: "REQUESTED",
        mentee: { id: "m-3", name: "Priya Sharma", username: "priya_s", email: "priya@example.com" },
      },
      {
        id: "req-2",
        status: "REQUESTED",
        mentee: { id: "m-4", name: "Marcus Vance", username: "demo_recruiter", email: "demo.recruiter@orbit.demo" },
      },
    ],
    communities: [
      {
        community: {
          id: "c-1",
          name: "Systems & Distributed Computing Guild",
          slug: "systems-guild",
          category: "ENGINEERING",
        },
      },
      {
        community: {
          id: "c-2",
          name: "Venture Builders & Technical Founders",
          slug: "venture-builders",
          category: "STARTUPS",
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
          id: "org-1",
          name: "Apex Innovations",
          slug: "apex-innovations",
          verification: {
            id: "ver-1",
            status: "VERIFIED",
            verifiedAt: now,
          },
          members: [
            { user: { id: "u-1", name: "David Sterling", email: "demo.organization@orbit.demo", role: "ADMIN" } },
            { user: { id: "u-2", name: "Marcus Vance", email: "demo.recruiter@orbit.demo", role: "MEMBER" } },
            { user: { id: "u-3", name: "Alex Rivera", email: "demo.talent@orbit.demo", role: "MEMBER" } },
          ],
          opportunities: [
            {
              id: "opp-1",
              title: "Senior Full-Stack Engineer",
              createdAt: now,
              _count: { applications: 18 },
            },
            {
              id: "opp-2",
              title: "Distributed Database Engineer",
              createdAt: now,
              _count: { applications: 9 },
            },
            {
              id: "opp-3",
              title: "Cloud Infrastructure Architect",
              createdAt: now,
              _count: { applications: 14 },
            },
          ],
          projects: [
            {
              id: "proj-1",
              title: "Next.js App Router Performance Benchmark",
              _count: { applications: 4 },
            },
            {
              id: "proj-2",
              title: "Event-Driven Telemetry Stream Engine",
              _count: { applications: 6 },
            },
          ],
          talentPools: [
            { id: "pool-1", name: "Verified Core Contributors", _count: { candidates: 24 } },
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
        id: "comm-1",
        name: "Builders & Hackers Guild",
        slug: "builders-hackers-guild",
        _count: { members: 342, posts: 58 },
        posts: [
          { id: "p-1", title: "Announcing Global Builder Hackathon 2026 track categories", createdAt: now },
          { id: "p-2", title: "Mentorship office hours open for team submissions", createdAt: now },
          { id: "p-3", title: "Ecosystem project demos scheduled for next Friday", createdAt: now },
        ],
      },
    ],
    events: [
      {
        id: "ev-1",
        title: "Global Builder Hackathon 2026",
        startDate: nextWeek,
        _count: { registrations: 186 },
      },
      {
        id: "ev-2",
        title: "Founder & Investor Demo Showcase",
        startDate: nextMonth,
        _count: { registrations: 94 },
      },
      {
        id: "ev-3",
        title: "Hands-on Workshop: Building with Next.js 15 & Supabase SSR",
        startDate: nextWeek,
        _count: { registrations: 112 },
      },
    ],
    hackathons: [
      {
        id: "hack-1",
        title: "Global Builder Hackathon 2026",
        startDate: nextWeek,
        _count: { registrations: 186 },
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
        organization: { name: "Apex Innovations", slug: "apex-innovations" },
      },
      {
        id: "ver-2",
        status: "PENDING",
        organization: { name: "Aether Dynamics Inc.", slug: "aether-dynamics" },
      },
      {
        id: "ver-3",
        status: "PENDING",
        organization: { name: "Nexus Quantum Labs", slug: "nexus-quantum" },
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
        title: "Milestone deliverable verification dispute",
        status: "OPEN",
      },
    ],
    recentAuditLogs: [
      {
        id: "log-1",
        action: "ORGANIZATION_VERIFY_REQUEST",
        createdAt: now,
        actor: { name: "David Sterling", email: "demo.organization@orbit.demo" },
      },
      {
        id: "log-2",
        action: "USER_ROLE_ELEVATED",
        createdAt: yesterday,
        actor: { name: "Sarah Jenkins", email: "demo.admin@orbit.demo" },
      },
      {
        id: "log-3",
        action: "HACKATHON_EVENT_PUBLISHED",
        createdAt: yesterday,
        actor: { name: "Maya Patel", email: "demo.organizer@orbit.demo" },
      },
    ],
  };
}
