import {
  PrismaClient,
  UserRole,
  OpportunityType,
  WorkMode,
  ApplicationStatus,
  ProjectStatus,
  RecruiterStage,
  EvidenceType,
  SkillProofType,
  NotificationType,
  ReportStatus,
  DisputeStatus,
} from "@prisma/client";
import { hashSync } from "bcryptjs";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { DEMO_ACCOUNTS, DEMO_ROLE_LIST, DEMO_PASSWORD_DEFAULT } from "../src/lib/auth/roles";

// Load environment variables if running outside Next.js
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env");
  } catch {
    // .env may not exist or already loaded
  }
}

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD || DEMO_PASSWORD_DEFAULT;
const PASSWORD_HASH = hashSync(DEMO_PASSWORD, 12);

async function syncSupabaseAuthUser(
  email: string,
  name: string,
  username: string,
  role: string,
  orbitRole: string
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !secretKey) {
    return null;
  }

  try {
    const supabase = createSupabaseClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.warn(`[Supabase Auth] Unable to list users: ${listError.message}`);
      return null;
    }

    const existingUser = listData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { name, username, role, orbitRole },
        }
      );
      if (updateError) {
        console.warn(`[Supabase Auth] Could not update ${email}: ${updateError.message}`);
        return existingUser.id;
      }
      return updated.user.id;
    } else {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name, username, role, orbitRole },
      });
      if (createError) {
        console.warn(`[Supabase Auth] Could not create ${email}: ${createError.message}`);
        return null;
      }
      return created.user.id;
    }
  } catch (err: any) {
    console.warn(`[Supabase Auth] Sync skipped (${err?.message || "connection error"}).`);
    return null;
  }
}

export async function seedDemoData() {
  console.log("--------------------------------------------------");
  console.log("ORBIT: Seeding synthetic Indian demo ecosystem");
  console.log("--------------------------------------------------");

  try {
    await prisma.$connect();
  } catch (dbErr: any) {
    console.error("\n==================================================");
    console.error("DATABASE CONNECTION ERROR");
    console.error("==================================================");
    console.error(`Prisma could not connect to PostgreSQL at: ${process.env.DATABASE_URL}`);
    console.error("\nNote: Demo accounts run seamlessly in Offline Demo Mode when DB is unreachable.");
    console.error("==================================================\n");
    throw dbErr;
  }

  // 1. SKILLS
  const skillList = [
    "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL",
    "Docker", "Kubernetes", "System Architecture", "Distributed Systems",
    "UI/UX Design", "Figma", "Product Strategy", "FastAPI", "Python",
    "AI/ML", "PyTorch", "Tailwind CSS",
  ];

  const skillsMap: Record<string, string> = {};
  for (const name of skillList) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skillsMap[name] = skill.id;
  }

  // 2. DEMO USERS & PROFILES
  const users: Record<string, any> = {};

  for (const roleKey of DEMO_ROLE_LIST) {
    const account = DEMO_ACCOUNTS[roleKey];
    const prismaRole =
      roleKey === "PLATFORM_ADMIN"
        ? UserRole.ADMIN
        : roleKey === "FOUNDER"
        ? UserRole.FOUNDER
        : UserRole.STUDENT;

    const supabaseId = await syncSupabaseAuthUser(
      account.email,
      account.name,
      account.username,
      prismaRole,
      roleKey
    );

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        username: account.username,
        role: prismaRole,
        passwordHash: PASSWORD_HASH,
        isSuspended: false,
      },
      create: {
        ...(supabaseId ? { id: supabaseId } : {}),
        email: account.email,
        name: account.name,
        username: account.username,
        role: prismaRole,
        passwordHash: PASSWORD_HASH,
        isSuspended: false,
      },
    });

    users[roleKey] = user;

    // Profile upsert
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        headline: account.headline,
        about: account.description,
        location: account.location,
        github: `https://github.com/${account.username}`,
        linkedin: `https://linkedin.com/in/${account.username}`,
      },
      create: {
        userId: user.id,
        headline: account.headline,
        about: account.description,
        location: account.location,
        github: `https://github.com/${account.username}`,
        linkedin: `https://linkedin.com/in/${account.username}`,
      },
    });

    console.log(`[Demo User] ${account.role.padEnd(20)} -> ${account.email} (${account.name})`);
  }

  const talentUser = users["TALENT"];
  const founderUser = users["FOUNDER"];
  const recruiterUser = users["RECRUITER"];
  const mentorUser = users["MENTOR"];
  const orgAdminUser = users["ORGANIZATION_ADMIN"];
  const organizerUser = users["COMMUNITY_ORGANIZER"];
  const adminUser = users["PLATFORM_ADMIN"];

  // Attach skills to Talent (Aarav Sharma)
  for (const skillName of ["TypeScript", "React", "Next.js", "Python", "FastAPI", "PostgreSQL", "AI/ML"]) {
    if (skillsMap[skillName]) {
      const talentProfile = await prisma.profile.findUnique({ where: { userId: talentUser.id } });
      if (talentProfile) {
        await prisma.profileSkill.upsert({
          where: {
            profileId_skillId: {
              profileId: talentProfile.id,
              skillId: skillsMap[skillName],
            },
          },
          update: {},
          create: {
            profileId: talentProfile.id,
            skillId: skillsMap[skillName],
          },
        });
      }
    }
  }

  // 3. ORGANIZATIONS
  // A. Astra Digital Technologies (Org Admin: Vikram Malhotra, Recruiter: Karan Verma)
  const astraOrg = await prisma.organization.upsert({
    where: { slug: "astra-digital" },
    update: {
      name: "Astra Digital Technologies",
      industry: "Enterprise Software & Cloud Platforms",
      description: "Next-generation distributed infrastructure, cloud migration accelerators, and enterprise design engineering.",
      verificationStatus: "VERIFIED",
    },
    create: {
      name: "Astra Digital Technologies",
      slug: "astra-digital",
      industry: "Enterprise Software & Cloud Platforms",
      description: "Next-generation distributed infrastructure, cloud migration accelerators, and enterprise design engineering.",
      website: "https://astradigital.in",
      email: "contact@astradigital.in",
      location: "Gurugram & Pune, India",
      verificationStatus: "VERIFIED",
    },
  });

  // Memberships
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: astraOrg.id, userId: orgAdminUser.id } },
    update: { role: "OWNER" },
    create: { organizationId: astraOrg.id, userId: orgAdminUser.id, role: "OWNER" },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: astraOrg.id, userId: recruiterUser.id } },
    update: { role: "ADMIN" },
    create: { organizationId: astraOrg.id, userId: recruiterUser.id, role: "ADMIN" },
  });

  // Verification record
  await prisma.organizationVerification.upsert({
    where: { organizationId: astraOrg.id },
    update: { status: "VERIFIED", notes: "Enterprise verification approved via DNS TXT challenge" },
    create: {
      organizationId: astraOrg.id,
      status: "VERIFIED",
      notes: "Enterprise verification approved via DNS TXT challenge",
      reviewedAt: new Date(),
      reviewedBy: adminUser.id,
    },
  });

  // B. Nexora Labs (Founder: Riya Mehta)
  const nexoraOrg = await prisma.organization.upsert({
    where: { slug: "nexora-labs" },
    update: {
      name: "Nexora Labs",
      industry: "AI / SaaS",
      description: "Autonomous workflow orchestration and verifiable cloud pipelines for enterprise teams.",
      verificationStatus: "VERIFIED",
    },
    create: {
      name: "Nexora Labs",
      slug: "nexora-labs",
      industry: "AI / SaaS",
      description: "Autonomous workflow orchestration and verifiable cloud pipelines for enterprise teams.",
      website: "https://nexoralabs.ai",
      email: "riya@nexoralabs.ai",
      location: "Mumbai & Bengaluru, India",
      verificationStatus: "VERIFIED",
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: nexoraOrg.id, userId: founderUser.id } },
    update: { role: "OWNER" },
    create: { organizationId: nexoraOrg.id, userId: founderUser.id, role: "OWNER" },
  });

  // C. India Builders Network (Community Organizer: Neha Kapoor)
  const ibnOrg = await prisma.organization.upsert({
    where: { slug: "india-builders-network" },
    update: {
      name: "India Builders Network",
      industry: "Developer Community & Hackathons",
      description: "National builder ecosystem driving hackathons, open-source sprints, and student developer growth across India.",
      verificationStatus: "VERIFIED",
    },
    create: {
      name: "India Builders Network",
      slug: "india-builders-network",
      industry: "Developer Community & Hackathons",
      description: "National builder ecosystem driving hackathons, open-source sprints, and student developer growth across India.",
      website: "https://indiabuilders.network",
      email: "community@indiabuilders.network",
      location: "Noida, Uttar Pradesh, India",
      verificationStatus: "VERIFIED",
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: ibnOrg.id, userId: organizerUser.id } },
    update: { role: "OWNER" },
    create: { organizationId: ibnOrg.id, userId: organizerUser.id, role: "OWNER" },
  });

  // 4. FOUNDER STARTUP PROFILE
  const startup = await prisma.startup.upsert({
    where: { slug: "nexora-labs" },
    update: {
      name: "Nexora Labs",
      stage: "MVP",
      problem: "Product engineering teams waste hundreds of hours each sprint resolving fragmented LLM pipelines, prompt regressions, and manual role approvals.",
      solution: "A cryptographic, verifiable agent engine with deterministic verification, multi-tenant state isolation, and unified AI coworker dots.",
      industry: "AI / SaaS",
      location: "Mumbai & Bengaluru, India",
    },
    create: {
      name: "Nexora Labs",
      slug: "nexora-labs",
      stage: "MVP",
      description: "Autonomous workflow orchestration and verifiable cloud pipelines for enterprise teams.",
      problem: "Product engineering teams waste hundreds of hours each sprint resolving fragmented LLM pipelines, prompt regressions, and manual role approvals.",
      solution: "A cryptographic, verifiable agent engine with deterministic verification, multi-tenant state isolation, and unified AI coworker dots.",
      industry: "AI / SaaS",
      location: "Mumbai & Bengaluru, India",
      creatorId: founderUser.id,
    },
  });

  // Milestones
  const existingMilestones = await prisma.startupMilestone.findMany({ where: { startupId: startup.id } });
  if (existingMilestones.length === 0) {
    await prisma.startupMilestone.createMany({
      data: [
        {
          startupId: startup.id,
          title: "Complete v1.0 Pilot Architecture",
          description: "Draft core state machine, verify deterministic cache, and publish SDK spec.",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
          status: "IN_PROGRESS",
        },
        {
          startupId: startup.id,
          title: "Deploy Security & RLS Enforcement Layer",
          description: "Full Supabase and PostgreSQL RLS audit, RBAC integration, and token validation.",
          dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          status: "COMPLETED",
        },
        {
          startupId: startup.id,
          title: "Onboard First 5 Enterprise Design Partners in Bengaluru",
          description: "Direct engineering pilot feedback loops and SLAs in Bengaluru.",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
          status: "PLANNED",
        },
      ],
    });
  }

  // 5. OPPORTUNITIES (All INR compensation)
  // Opp 1: Nexora Labs Frontend Engineer Intern
  let oppFrontend = await prisma.opportunity.findFirst({
    where: { organizationId: nexoraOrg.id, title: "Frontend Engineer Intern" },
  });
  if (!oppFrontend) {
    oppFrontend = await prisma.opportunity.create({
      data: {
        organizationId: nexoraOrg.id,
        title: "Frontend Engineer Intern",
        type: OpportunityType.INTERNSHIP,
        workMode: WorkMode.HYBRID,
        location: "Bengaluru, Karnataka (Hybrid)",
        compensation: "₹4 LPA – ₹6 LPA",
        description: "Join Nexora Labs to build intuitive, high-velocity web interfaces for our autonomous AI SaaS engine.",
        eligibility: "Proficiency in React, Next.js, and TypeScript with open-source project evidence.",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
        isActive: true,
      },
    });
  }

  // Opp 2: Nexora Labs AI Engineering Intern
  let oppAi = await prisma.opportunity.findFirst({
    where: { organizationId: nexoraOrg.id, title: "AI Engineering Intern" },
  });
  if (!oppAi) {
    oppAi = await prisma.opportunity.create({
      data: {
        organizationId: nexoraOrg.id,
        title: "AI Engineering Intern",
        type: OpportunityType.INTERNSHIP,
        workMode: WorkMode.REMOTE,
        location: "Remote (India)",
        compensation: "₹5 LPA – ₹8 LPA",
        description: "Nexora Labs is seeking an AI Engineering Intern to develop and benchmark autonomous agent orchestration pipelines.",
        eligibility: "Working knowledge of Python 3.11+, async FastAPI, and LLM APIs.",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
        isActive: true,
      },
    });
  }

  // Opp 3: Astra Digital Technologies Full Stack Developer
  let oppFullStack = await prisma.opportunity.findFirst({
    where: { organizationId: astraOrg.id, title: "Full Stack Developer" },
  });
  if (!oppFullStack) {
    oppFullStack = await prisma.opportunity.create({
      data: {
        organizationId: astraOrg.id,
        title: "Full Stack Developer",
        type: OpportunityType.JOB,
        workMode: WorkMode.REMOTE,
        location: "Pune / Remote",
        compensation: "₹10 LPA – ₹16 LPA",
        description: "Architect and scale distributed enterprise microservices at Astra Digital Technologies.",
        eligibility: "Strong background in TypeScript, React, Next.js, Node.js, and PostgreSQL.",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35),
        isActive: true,
      },
    });
  }

  // Opp 4: Astra Digital Product Designer
  let oppDesigner = await prisma.opportunity.findFirst({
    where: { organizationId: astraOrg.id, title: "Product Designer" },
  });
  if (!oppDesigner) {
    oppDesigner = await prisma.opportunity.create({
      data: {
        organizationId: astraOrg.id,
        title: "Product Designer",
        type: OpportunityType.JOB,
        workMode: WorkMode.HYBRID,
        location: "Gurugram, Haryana (Hybrid)",
        compensation: "₹8 LPA – ₹14 LPA",
        description: "Craft elegant design systems, typography standards, and enterprise developer consoles.",
        eligibility: "Mastery of Figma components, design tokens, and user research.",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        isActive: true,
      },
    });
  }

  // 6. TALENT APPLICATIONS (Aarav Sharma)
  // Aarav -> Frontend Engineer Intern: SHORTLISTED
  await prisma.opportunityApplication.upsert({
    where: { opportunityId_userId: { opportunityId: oppFrontend.id, userId: talentUser.id } },
    update: { status: ApplicationStatus.SHORTLISTED },
    create: {
      opportunityId: oppFrontend.id,
      userId: talentUser.id,
      status: ApplicationStatus.SHORTLISTED,
      notes: "High-signal applicant with verifiable proof of work in Next.js and open source.",
    },
  });

  // Aarav -> AI Engineering Intern: UNDER_REVIEW
  await prisma.opportunityApplication.upsert({
    where: { opportunityId_userId: { opportunityId: oppAi.id, userId: talentUser.id } },
    update: { status: ApplicationStatus.UNDER_REVIEW },
    create: {
      opportunityId: oppAi.id,
      userId: talentUser.id,
      status: ApplicationStatus.UNDER_REVIEW,
      notes: "Strong Python and FastAPI knowledge; AI Career Copilot evaluation matches well.",
    },
  });

  // Saved Opp
  await prisma.savedOpportunity.upsert({
    where: { opportunityId_userId: { opportunityId: oppFullStack.id, userId: talentUser.id } },
    update: {},
    create: { userId: talentUser.id, opportunityId: oppFullStack.id },
  });

  // 7. PROJECTS & VERIFIED WORK (Proof of Work Loop)
  let copilotProject = await prisma.project.findFirst({
    where: { title: "AI Career Copilot" },
  });

  if (!copilotProject) {
    copilotProject = await prisma.project.create({
      data: {
        organizationId: astraOrg.id,
        title: "AI Career Copilot",
        problem: "Indian computer science graduates struggle to stand out through traditional keyword resumes.",
        scope: "Build a verifiable portfolio analyzer that inspects commit history and PR complexity.",
        deliverable: "TypeScript and Next.js service repository with full integration test suite.",
        acceptanceCriteria: "Sub-5ms cosine retrieval benchmark; test coverage > 90%.",
        payment: "₹50,000 milestone grant",
        status: ProjectStatus.IN_PROGRESS,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 24),
      },
    });
  }

  // Project Application
  await prisma.projectApplication.upsert({
    where: { projectId_userId: { projectId: copilotProject.id, userId: talentUser.id } },
    update: { status: "ACCEPTED" },
    create: {
      projectId: copilotProject.id,
      userId: talentUser.id,
      status: "ACCEPTED",
      proposal: "Designing low-latency vector retrieval pipelines with Next.js and FastAPI.",
    },
  });

  // Verified Work Record for Aarav Sharma
  const existingVwr = await prisma.verifiedWorkRecord.findFirst({
    where: { projectId: copilotProject.id, userId: talentUser.id },
  });
  if (!existingVwr) {
    await prisma.verifiedWorkRecord.create({
      data: {
        projectId: copilotProject.id,
        userId: talentUser.id,
        organizationId: astraOrg.id,
        projectTitle: "Built Scalable RPC Cache Engine",
        orgName: "Astra Digital Technologies",
        userRole: "Distributed Systems Contributor",
        scope: "Implemented sharded queue ingestion and PostgreSQL partition schema.",
        deliverableUrl: "https://github.com/demo_talent/orbit-engine",
        completionDate: new Date(),
        evidenceUrl: "https://github.com/demo_talent/orbit-engine#0x8f2c31e9a4d7b290",
      },
    });
  }

  // 8. MENTORSHIP
  const mentorProfile = await prisma.mentorProfile.upsert({
    where: { userId: mentorUser.id },
    update: {
      isVerified: true,
      expertise: "Artificial Intelligence, Product Strategy, Startup Validation, Distributed Systems",
      industries: "AI / SaaS, Enterprise Platforms, Cloud Infrastructure",
      experienceYears: 12,
      topics: "System architecture, career transitions, scaling AI applications, deterministic verification",
      availability: "4 hours/month, Thursday afternoons IST",
      mentoringFormat: "1:1 Advisory & Architectural Review",
    },
    create: {
      userId: mentorUser.id,
      isVerified: true,
      expertise: "Artificial Intelligence, Product Strategy, Startup Validation, Distributed Systems",
      industries: "AI / SaaS, Enterprise Platforms, Cloud Infrastructure",
      experienceYears: 12,
      topics: "System architecture, career transitions, scaling AI applications, deterministic verification",
      availability: "4 hours/month, Thursday afternoons IST",
      mentoringFormat: "1:1 Advisory & Architectural Review",
    },
  });

  const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const mentorReq = await prisma.mentorshipRequest.create({
    data: {
      mentorId: mentorUser.id,
      menteeId: talentUser.id,
      topic: "Transitioning to Production AI Agent Pipelines & Proof of Work",
      goals: "Review state synchronization architecture for high-concurrency event stream in AI Career Copilot.",
      status: "ACCEPTED",
    },
  });

  await prisma.mentorshipSession.create({
    data: {
      requestId: mentorReq.id,
      mentorId: mentorUser.id,
      menteeId: talentUser.id,
      scheduledAt: tomorrow,
      status: "SCHEDULED",
    },
  });

  // 9. EVENTS & HACKATHONS
  const hackathonEvent = await prisma.event.create({
    data: {
      organizationId: ibnOrg.id,
      organizerName: "India Builders Network",
      title: "Orbit India Buildathon 2026",
      description: "India's premier digital buildathon for next-generation AI agents and high-performance web systems.",
      type: "HACKATHON",
      format: "ONLINE",
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 13),
      isFree: true,
    },
  });

  await prisma.eventRegistration.create({
    data: {
      eventId: hackathonEvent.id,
      userId: talentUser.id,
    },
  });

  // 10. COMMUNITIES
  const aiCommunity = await prisma.community.upsert({
    where: { slug: "ai-builders-india" },
    update: {
      name: "AI Builders India",
      description: "India's premier community of LLM engineers, researchers, and agentic systems developers.",
    },
    create: {
      name: "AI Builders India",
      slug: "ai-builders-india",
      description: "India's premier community of LLM engineers, researchers, and agentic systems developers.",
      category: "AI Builders",
      creatorId: organizerUser.id,
    },
  });

  for (const u of [talentUser, founderUser, mentorUser, organizerUser]) {
    await prisma.communityMember.upsert({
      where: { id: `cm-${aiCommunity.id}-${u.id}` },
      update: {},
      create: {
        id: `cm-${aiCommunity.id}-${u.id}`,
        communityId: aiCommunity.id,
        userId: u.id,
        role: u.id === organizerUser.id ? "ADMIN" : "MEMBER",
      },
    });
  }

  // 11. MESSAGES (Aarav Sharma ↔ Riya Mehta)
  const conv = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [{ userId: founderUser.id }, { userId: talentUser.id }],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv.id,
        senderId: founderUser.id,
        content: "Hi Aarav! We reviewed your Orbit profile and GitHub repositories. Your Next.js and TypeScript projects look very clean. Would you be open to discussing our Frontend Engineer Intern role at Nexora Labs?",
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        conversationId: conv.id,
        senderId: talentUser.id,
        content: "Hello Riya, thank you for reaching out! I'm very interested in Nexora Labs' work on AI SaaS orchestration. I'd love to learn more about the team's roadmap and how I can contribute.",
        createdAt: new Date(Date.now() - 3600000 * 20),
      },
      {
        conversationId: conv.id,
        senderId: founderUser.id,
        content: "Fantastic! Let's set up a quick 20-minute chat this Thursday at 3 PM IST to dive into the architecture.",
        createdAt: new Date(Date.now() - 3600000 * 15),
      },
    ],
  });

  // 12. NOTIFICATIONS
  await prisma.notification.createMany({
    data: [
      {
        userId: talentUser.id,
        type: NotificationType.APPLICATION_STATUS,
        title: "Application Shortlisted!",
        body: "Your application for Frontend Engineer Intern at Nexora Labs was shortlisted by Riya Mehta.",
        isRead: false,
        link: "/dashboard",
      },
      {
        userId: founderUser.id,
        type: NotificationType.MESSAGE,
        title: "Candidate Responded",
        body: "Aarav Sharma responded to your message regarding the Frontend Engineer Intern position.",
        isRead: false,
        link: `/messages/${conv.id}`,
      },
      {
        userId: talentUser.id,
        type: NotificationType.SYSTEM,
        title: "Advisory Session Confirmed",
        body: "Advisory session with Dr. Ananya Iyer is scheduled for tomorrow at 4 PM IST.",
        isRead: true,
        link: "/dashboard",
      },
    ],
  });

  console.log("--------------------------------------------------");
  console.log("ORBIT: Successfully seeded synthetic Indian demo ecosystem!");
  console.log(`Demo Credentials: All 7 personas use password '${DEMO_PASSWORD}'`);
  console.log("--------------------------------------------------");
}

if (require.main === module) {
  seedDemoData()
    .catch((err) => {
      console.error("Seed demo failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
