// @ts-nocheck — seed file runs via tsx, not tsc
import { PrismaClient } from "@prisma/client";

import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up
  await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.opportunityApplication.deleteMany();
  await prisma.projectApplication.deleteMany();
  await prisma.savedOpportunity.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.hackathonMember.deleteMany();
  await prisma.hackathonTeam.deleteMany();
  await prisma.event.deleteMany();
  await prisma.verifiedWorkRecord.deleteMany();
  await prisma.opportunitySkill.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profileSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profileExperience.deleteMany();
  await prisma.profileEducation.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.organizationVerification.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.create({
    data: {
      name: "Orbit Admin",
      email: "admin@orbit.app",
      username: "orbit_admin",
      role: UserRole.ADMIN,
      passwordHash: hashSync("Admin@1234", 12),
      isEmailVerified: true,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Arjun Sharma",
      email: "arjun@example.com",
      username: "arjun_s",
      role: UserRole.STUDENT,
      passwordHash: hashSync("Student@1234", 12),
      isEmailVerified: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Priya Nair",
      email: "priya@example.com",
      username: "priya_n",
      role: UserRole.STUDENT,
      passwordHash: hashSync("Student@1234", 12),
      isEmailVerified: true,
    },
  });

  const founder1 = await prisma.user.create({
    data: {
      name: "Rohan Mehta",
      email: "rohan@raftlabs.io",
      username: "rohan_m",
      role: UserRole.FOUNDER,
      passwordHash: hashSync("Founder@1234", 12),
      isEmailVerified: true,
    },
  });

  // ── Skills ─────────────────────────────────────────────────────────────────
  const skillNames = [
    "React", "Next.js", "TypeScript", "Node.js", "Python",
    "PostgreSQL", "UI/UX Design", "Figma", "Machine Learning",
    "FastAPI", "Docker", "AWS", "Content Writing", "Marketing",
  ];

  const skills = await Promise.all(
    skillNames.map((name) => prisma.skill.create({ data: { name } }))
  );
  const skillMap = Object.fromEntries(skills.map((s) => [s.name, s]));

  // ── Profiles ───────────────────────────────────────────────────────────────
  await prisma.profile.create({
    data: {
      userId: student1.id,
      headline: "Final-year CS student at BITS Pilani | React & Node developer",
      about: "I build fast, accessible web apps. Currently looking for SDE internships starting June 2025.",
      location: "Pune, India",
      college: "BITS Pilani",
      github: "https://github.com/arjunsharma",
      linkedin: "https://linkedin.com/in/arjunsharma",
      skills: {
        create: [
          { skillId: skillMap["React"].id },
          { skillId: skillMap["TypeScript"].id },
          { skillId: skillMap["Node.js"].id },
        ],
      },
      education: {
        create: {
          institution: "BITS Pilani",
          degree: "B.E. Computer Science",
          startYear: 2021,
          endYear: 2025,
          current: false,
        },
      },
    },
  });

  await prisma.profile.create({
    data: {
      userId: student2.id,
      headline: "Product designer & frontend developer | Open to freelance projects",
      about: "3 years building design systems and React components for early-stage startups.",
      location: "Bangalore, India",
      college: "RV College of Engineering",
      github: "https://github.com/priyanair",
      portfolio: "https://priya.design",
      skills: {
        create: [
          { skillId: skillMap["UI/UX Design"].id },
          { skillId: skillMap["Figma"].id },
          { skillId: skillMap["React"].id },
        ],
      },
    },
  });

  // ── Organization ───────────────────────────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: "Raft Labs",
      slug: "raft-labs",
      description: "Raft Labs is a B2B SaaS company building workflow automation tools for SMEs. We are a team of 12 working remotely across India.",
      industry: "B2B SaaS",
      location: "Remote, India",
      website: "https://raftlabs.io",
      email: "hiring@raftlabs.io",
      verificationStatus: "VERIFIED",
      members: {
        create: { userId: founder1.id, role: "OWNER" },
      },
    },
  });

  // Mark verified
  await prisma.organizationVerification.create({
    data: {
      organizationId: org.id,
      status: "VERIFIED",
      notes: "Verified via LinkedIn and company website",
      reviewedAt: new Date(),
      reviewedBy: adminUser.id,
    },
  });

  // ── Opportunities ──────────────────────────────────────────────────────────
  const opp1 = await prisma.opportunity.create({
    data: {
      organizationId: org.id,
      title: "Frontend Engineer Intern",
      type: OpportunityType.INTERNSHIP,
      description: `We are looking for a frontend engineering intern to join our product team for 3 months starting January 2025.

You will work directly with our lead engineer on our React component library and help ship two product features that are already in spec.

We ship weekly. You will be in sprint planning, code review, and retrospectives. This is not a shadow role.`,
      location: "Remote",
      workMode: WorkMode.REMOTE,
      compensation: "₹20,000/month stipend",
      duration: "3 months",
      eligibility: "Students in final year or pre-final year of their CS/IT degree. Graduation between 2025–2026.",
      applicationReqs: "Please include a GitHub link and a brief (3–5 sentence) cover letter explaining why you want to work with us specifically.",
      deadline: new Date("2025-01-15"),
      skills: {
        create: [
          { skillId: skillMap["React"].id },
          { skillId: skillMap["TypeScript"].id },
        ],
      },
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      organizationId: org.id,
      title: "Product Designer",
      type: OpportunityType.STARTUP_ROLE,
      description: `We are a 12-person team and we have no designer. We are looking for our first product designer to own the end-to-end design of our core workflow builder.

You will work directly with the founders. We are lean, ship fast, and you will have real impact from day one.`,
      location: "Bangalore preferred / Remote negotiable",
      workMode: WorkMode.HYBRID,
      compensation: "Market rate, based on experience",
      eligibility: "Open to professionals and final-year students with strong portfolios.",
      applicationReqs: "Portfolio link required. Include 2–3 case studies showing your product design process.",
      skills: {
        create: [
          { skillId: skillMap["UI/UX Design"].id },
          { skillId: skillMap["Figma"].id },
        ],
      },
    },
  });

  // ── Projects ───────────────────────────────────────────────────────────────
  await prisma.project.create({
    data: {
      organizationId: org.id,
      title: "Build a reusable data table component in React",
      problem: "Our engineering team currently copies and modifies a data table component across 6 different product pages. There is no shared component, which causes inconsistencies and duplicated bugs.",
      scope: "Design and build a single, reusable React data table component with: column sorting, pagination, row selection, a loading skeleton state, and basic search/filter support. Must match our existing Tailwind design system (tokens will be provided).",
      deliverable: "A publishable npm package or a standalone React component with full TypeScript types, Storybook stories for all variants, and a README covering all props.",
      acceptanceCriteria: "All 5 features functional and tested. Storybook deployed to a shareable URL. TypeScript passes with strict mode. Reviewed and approved by our lead engineer.",
      payment: "$600 fixed",
      expectedHours: 40,
      deadline: new Date("2025-02-01"),
      ipTerms: "All IP transfers to Raft Labs upon payment. Contributor may mention the project publicly but may not publish the source code.",
      status: ProjectStatus.OPEN,
      skills: {
        create: [
          { skillId: skillMap["React"].id },
          { skillId: skillMap["TypeScript"].id },
        ],
      },
    },
  });

  // ── Events ─────────────────────────────────────────────────────────────────
  await prisma.event.create({
    data: {
      title: "HackIndia Delhi 2025",
      description: "A 36-hour in-person hackathon in New Delhi. Build products across tracks including EdTech, HealthTech, and Open Innovation. ₹5L+ in prizes.",
      type: "HACKATHON",
      format: "OFFLINE",
      city: "New Delhi",
      venue: "IIT Delhi, Hauz Khas",
      startDate: new Date("2025-02-15T09:00:00Z"),
      endDate: new Date("2025-02-16T21:00:00Z"),
      registrationDeadline: new Date("2025-02-01"),
      isFree: true,
      organizerName: "HackIndia Foundation",
      registrationUrl: "https://hackindia.com",
    },
  });

  await prisma.event.create({
    data: {
      title: "Startup Demo Day — January 2025",
      description: "10 early-stage startups present 5-minute pitches to investors and operators. Open for founders to apply to pitch and for the public to attend.",
      type: "DEMO_DAY",
      format: "HYBRID",
      city: "Bangalore",
      venue: "91springboard, Koramangala",
      startDate: new Date("2025-01-28T17:00:00Z"),
      endDate: new Date("2025-01-28T21:00:00Z"),
      isFree: false,
      price: "Free to watch · ₹2000 to pitch",
      organizerName: "Bangalore Founders Club",
      registrationUrl: "https://bfcclub.io/demo-day",
    },
  });

  // ── Hackathon team ─────────────────────────────────────────────────────────
  await prisma.hackathonTeam.create({
    data: {
      name: "Polaris",
      description: "Building a real-time collaborative whiteboard for HackIndia Delhi.",
      projectIdea: "A multiplayer whiteboard app with AI-assisted layout suggestions. Think Figma meets Notion canvas, built in 36 hours.",
      rolesNeeded: "1 backend engineer (Node/WebSockets), 1 UI designer",
      isOpen: true,
      members: {
        create: { userId: student1.id, role: "OWNER" },
      },
    },
  });

  // ── Verified work record ───────────────────────────────────────────────────
  await prisma.verifiedWorkRecord.create({
    data: {
      userId: student2.id,
      projectTitle: "Redesigned onboarding flow for Raft Labs",
      orgName: "Raft Labs",
      userRole: "Product Designer",
      scope: "End-to-end redesign of the user onboarding flow — from signup to first workflow created. Reduced steps from 9 to 5.",
      completionDate: new Date("2024-11-01"),
      deliverableUrl: "https://www.figma.com/file/example",
      reviewText: "Priya delivered exactly what was scoped, ahead of schedule. Would work with her again.",
      verifiedAt: new Date(),
      verifiedByOrgId: org.id,
    },
  });

  console.log("✅ Seed complete.");
  console.log("\nTest accounts:");
  console.log("  Admin:   admin@orbit.app / Admin@1234");
  console.log("  Student: arjun@example.com / Student@1234");
  console.log("  Student: priya@example.com / Student@1234");
  console.log("  Founder: rohan@raftlabs.io / Founder@1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
