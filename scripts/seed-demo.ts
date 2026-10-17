import { PrismaClient, UserRole, OpportunityType, WorkMode, ApplicationStatus, ProjectStatus, RecruiterStage, EvidenceType, SkillProofType, NotificationType, ReportStatus, DisputeStatus } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { DEMO_ACCOUNTS, DEMO_ROLE_LIST } from "../src/lib/auth/roles";

// Load environment variables if running outside Next.js
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env");
  } catch {
    // .env may not exist or already loaded
  }
}

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD || "OrbitDemo@2025!";
const PASSWORD_HASH = hashSync(DEMO_PASSWORD, 12);

async function syncSupabaseAuthUser(email: string, name: string, username: string, role: string, orbitRole: string) {
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
  console.log("ORBIT: Seeding production-quality demo ecosystem");
  console.log("--------------------------------------------------");

  try {
    await prisma.$connect();
  } catch (dbErr: any) {
    console.error("\n==================================================");
    console.error("DATABASE CONNECTION ERROR");
    console.error("==================================================");
    console.error(`Prisma could not connect to PostgreSQL at: ${process.env.DATABASE_URL}`);
    console.error("\nReason: The database server is not running or unreachable.");
    console.error("\nHow to fix:");
    console.error("  1. If using Supabase Cloud: Update .env with your project URL & database string:");
    console.error("       NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co");
    console.error("       DATABASE_URL=postgresql://postgres:<password>@aws-0-region.pooler.supabase.com:6543/postgres");
    console.error("  2. If using local Supabase CLI / Docker: Start your local containers ('supabase start').");
    console.error("==================================================\n");
    throw dbErr;
  }

  // 1. SKILLS
  const skillList = [
    "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL",
    "Docker", "Kubernetes", "System Architecture", "Distributed Systems",
    "UI/UX Design", "Figma", "Product Strategy", "GraphQL", "Python",
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
        location: "San Francisco, CA",
        github: `https://github.com/${account.username}`,
        linkedin: `https://linkedin.com/in/${account.username}`,
      },
      create: {
        userId: user.id,
        headline: account.headline,
        about: account.description,
        location: "San Francisco, CA",
        github: `https://github.com/${account.username}`,
        linkedin: `https://linkedin.com/in/${account.username}`,
      },
    });

    console.log(`[Demo User] ${account.role.padEnd(20)} -> ${account.email}`);
  }

  const talentUser = users["TALENT"];
  const founderUser = users["FOUNDER"];
  const recruiterUser = users["RECRUITER"];
  const mentorUser = users["MENTOR"];
  const orgAdminUser = users["ORGANIZATION_ADMIN"];
  const organizerUser = users["COMMUNITY_ORGANIZER"];
  const adminUser = users["PLATFORM_ADMIN"];

  // Attach skills to Talent
  for (const skillName of ["TypeScript", "React", "Next.js", "PostgreSQL", "Distributed Systems"]) {
    if (skillsMap[skillName]) {
      await prisma.profileSkill.upsert({
        where: {
          profileId_skillId: {
            profileId: (await prisma.profile.findUnique({ where: { userId: talentUser.id } }))!.id,
            skillId: skillsMap[skillName],
          },
        },
        update: {},
        create: {
          profileId: (await prisma.profile.findUnique({ where: { userId: talentUser.id } }))!.id,
          skillId: skillsMap[skillName],
        },
      });
    }
  }

  // 3. ORGANIZATIONS
  // A. Apex Innovations (Org Admin: David Sterling, Recruiter: Marcus Vance)
  const apexOrg = await prisma.organization.upsert({
    where: { slug: "apex-innovations" },
    update: {
      name: "Apex Innovations",
      industry: "Enterprise Infrastructure & Distributed Systems",
      description: "Apex Innovations builds fault-tolerant, high-throughput cloud infrastructure software.",
      verificationStatus: "VERIFIED",
    },
    create: {
      name: "Apex Innovations",
      slug: "apex-innovations",
      industry: "Enterprise Infrastructure & Distributed Systems",
      description: "Apex Innovations builds fault-tolerant, high-throughput cloud infrastructure software.",
      website: "https://apex-innovations.demo",
      email: "team@apex-innovations.demo",
      location: "San Francisco, CA",
      verificationStatus: "VERIFIED",
    },
  });

  // Memberships
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: apexOrg.id, userId: orgAdminUser.id } },
    update: { role: "OWNER" },
    create: { organizationId: apexOrg.id, userId: orgAdminUser.id, role: "OWNER" },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: apexOrg.id, userId: recruiterUser.id } },
    update: { role: "ADMIN" },
    create: { organizationId: apexOrg.id, userId: recruiterUser.id, role: "ADMIN" },
  });

  // Verification record
  await prisma.organizationVerification.upsert({
    where: { organizationId: apexOrg.id },
    update: { status: "VERIFIED", notes: "Enterprise verification approved" },
    create: {
      organizationId: apexOrg.id,
      status: "VERIFIED",
      notes: "Enterprise verification approved",
      reviewedAt: new Date(),
      reviewedBy: adminUser.id,
    },
  });

  // B. Aether Dynamics (Founder: Elena Rostova)
  const aetherOrg = await prisma.organization.upsert({
    where: { slug: "aether-dynamics-org" },
    update: {
      name: "Aether Dynamics",
      industry: "Developer Tools & AI Systems",
      description: "Autonomous workflow orchestration systems for distributed engineering teams.",
      verificationStatus: "PENDING",
    },
    create: {
      name: "Aether Dynamics",
      slug: "aether-dynamics-org",
      industry: "Developer Tools & AI Systems",
      description: "Autonomous workflow orchestration systems for distributed engineering teams.",
      website: "https://aether-dynamics.demo",
      email: "contact@aether-dynamics.demo",
      location: "Austin, TX",
      verificationStatus: "PENDING",
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: aetherOrg.id, userId: founderUser.id } },
    update: { role: "OWNER" },
    create: { organizationId: aetherOrg.id, userId: founderUser.id, role: "OWNER" },
  });

  // 4. FOUNDER STARTUP PROFILE
  const startup = await prisma.startup.upsert({
    where: { slug: "aether-dynamics" },
    update: {
      name: "Aether Dynamics",
      stage: "SEED",
      problem: "Engineering teams lose 30% of sprint capacity to manual cross-service coordination and synchronization.",
      solution: "An autonomous workflow orchestrator providing deterministically synchronized distributed workflows.",
      industry: "Developer Tools",
      location: "Austin, TX / Remote",
    },
    create: {
      name: "Aether Dynamics",
      slug: "aether-dynamics",
      stage: "SEED",
      description: "Developing autonomous workflow orchestration systems for modern engineering organizations.",
      problem: "Engineering teams lose 30% of sprint capacity to manual cross-service coordination and synchronization.",
      solution: "An autonomous workflow orchestrator providing deterministically synchronized distributed workflows.",
      industry: "Developer Tools",
      location: "Austin, TX / Remote",
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
          title: "Complete Core Protocol Engine v0.9",
          description: "Ship deterministic event replay and state-machine verification.",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          status: "IN_PROGRESS",
        },
        {
          startupId: startup.id,
          title: "Hire Founding Full-Stack Engineer",
          description: "Close first key hire to lead UI and SDK surface.",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
          status: "IN_PROGRESS",
        },
      ],
    });
  }

  // 5. OPPORTUNITIES
  // Opp 1: Elena Rostova's Founding Role
  let oppFounder = await prisma.opportunity.findFirst({
    where: { organizationId: aetherOrg.id, title: "Full-Stack Software Engineer (Founding Team)" },
  });
  if (!oppFounder) {
    oppFounder = await prisma.opportunity.create({
      data: {
        organizationId: aetherOrg.id,
        title: "Full-Stack Software Engineer (Founding Team)",
        type: OpportunityType.STARTUP_ROLE,
        workMode: WorkMode.REMOTE,
        location: "Remote / US",
        compensation: "$130k - $160k + 1.5% Equity",
        description: "Join as our founding full-stack engineer. Build Orbit integrations and real-time dashboard SDKs.",
        eligibility: "Experience with TypeScript, React, Node.js, and distributed systems.",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
        isActive: true,
      },
    });
  }

  // Opp 2: Apex Innovations Senior Backend Role
  let oppApex = await prisma.opportunity.findFirst({
    where: { organizationId: apexOrg.id, title: "Senior Backend Systems Engineer" },
  });
  if (!oppApex) {
    oppApex = await prisma.opportunity.create({
      data: {
        organizationId: apexOrg.id,
        title: "Senior Backend Systems Engineer",
        type: OpportunityType.JOB,
        workMode: WorkMode.HYBRID,
        location: "San Francisco, CA",
        compensation: "$165k - $190k + Competitive Equity",
        description: "Architect high-throughput data pipelines and event streaming nodes for enterprise clients.",
        eligibility: "Proven background in PostgreSQL, distributed systems, and telemetry.",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        isActive: true,
      },
    });
  }

  // 6. TALENT APPLICATIONS (Interconnected Data)
  await prisma.opportunityApplication.upsert({
    where: { opportunityId_userId: { opportunityId: oppFounder.id, userId: talentUser.id } },
    update: { status: ApplicationStatus.SHORTLISTED },
    create: {
      opportunityId: oppFounder.id,
      userId: talentUser.id,
      status: ApplicationStatus.SHORTLISTED,
      notes: "Ecosystem talent applicant with verified proof of work in distributed systems.",
    },
  });

  await prisma.opportunityApplication.upsert({
    where: { opportunityId_userId: { opportunityId: oppApex.id, userId: talentUser.id } },
    update: { status: ApplicationStatus.UNDER_REVIEW },
    create: {
      opportunityId: oppApex.id,
      userId: talentUser.id,
      status: ApplicationStatus.UNDER_REVIEW,
      notes: "Applied with verified completion record from Apex Audit Pipeline project.",
    },
  });

  // Saved Opp
  await prisma.savedOpportunity.upsert({
    where: { opportunityId_userId: { opportunityId: oppFounder.id, userId: talentUser.id } },
    update: {},
    create: { userId: talentUser.id, opportunityId: oppFounder.id },
  });

  // 7. PROJECTS & VERIFIED WORK (Proof of Work Loop)
  let auditProject = await prisma.project.findFirst({
    where: { organizationId: apexOrg.id, title: "Distributed Audit & Event Ingestion Pipeline" },
  });

  if (!auditProject) {
    auditProject = await prisma.project.create({
      data: {
        organizationId: apexOrg.id,
        title: "Distributed Audit & Event Ingestion Pipeline",
        problem: "We require an idempotent ingestion service capable of ingesting 10,000 security audit events per second.",
        scope: "Implement sharded queue ingestion, schema validation, and PostgreSQL storage adapter.",
        deliverable: "TypeScript service repository with full integration test suite and benchmarks.",
        acceptanceCriteria: "Zero data loss under simulated network partitions; test coverage > 90%.",
        payment: "$1,800 milestone reward",
        status: ProjectStatus.COMPLETED,
        deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      },
    });
  }

  // Project Application
  await prisma.projectApplication.upsert({
    where: { projectId_userId: { projectId: auditProject.id, userId: talentUser.id } },
    update: { status: "ACCEPTED" },
    create: {
      projectId: auditProject.id,
      userId: talentUser.id,
      status: "ACCEPTED",
      proposal: "I will design an event stream pipeline with PostgreSQL partition tables and benchmark suite.",
    },
  });

  // Verified Work Record
  const existingVwr = await prisma.verifiedWorkRecord.findFirst({
    where: { projectId: auditProject.id, userId: talentUser.id },
  });
  if (!existingVwr) {
    await prisma.verifiedWorkRecord.create({
      data: {
        projectId: auditProject.id,
        userId: talentUser.id,
        organizationId: apexOrg.id,
        projectTitle: auditProject.title,
        orgName: "Apex Innovations",
        userRole: "Distributed Systems Contributor",
        scope: "Implemented sharded queue ingestion and PostgreSQL partition schema.",
        deliverableUrl: "https://github.com/demo_talent/apex-audit-pipeline",
        completionDate: new Date(),
        reviewerName: "David Sterling",
        reviewText: "Exceptional architecture and test discipline. Shipped ahead of deadline with zero bugs.",
      },
    });
  }

  // Skill Evidence
  const existingEvidence = await prisma.skillEvidence.findFirst({
    where: { userId: talentUser.id, title: "Distributed Audit Pipeline Implementation" },
  });
  if (!existingEvidence) {
    await prisma.skillEvidence.create({
      data: {
        userId: talentUser.id,
        skillName: "Distributed Systems",
        evidenceType: EvidenceType.VERIFIED,
        proofType: SkillProofType.VERIFIED_WORK,
        title: "Distributed Audit Pipeline Implementation",
        context: "Production-grade event pipeline handling 10k eps with idempotent guarantees.",
        url: "https://github.com/demo_talent/apex-audit-pipeline",
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: orgAdminUser.id,
      },
    });
  }

  // 8. RECRUITER PIPELINE & TALENT POOLS
  const talentPool = await prisma.talentPool.upsert({
    where: { id: "pool-distributed-eng-apex" },
    update: {},
    create: {
      id: "pool-distributed-eng-apex",
      organizationId: apexOrg.id,
      name: "Systems & Distributed Engineering (Q1)",
      description: "Vetted candidates with verifiable track records in backend infrastructure.",
      tags: "distributed-systems,postgresql,typescript",
    },
  });

  await prisma.talentPoolCandidate.upsert({
    where: { poolId_candidateId: { poolId: talentPool.id, candidateId: talentUser.id } },
    update: { notes: "Verified top performer on Apex open pipeline." },
    create: {
      poolId: talentPool.id,
      candidateId: talentUser.id,
      notes: "Verified top performer on Apex open pipeline.",
      tags: "vetted,high-priority",
    },
  });

  const shortlist = await prisma.candidateShortlist.upsert({
    where: { id: "shortlist-backend-apex" },
    update: {},
    create: {
      id: "shortlist-backend-apex",
      organizationId: apexOrg.id,
      name: "Senior Backend Engineering Shortlist",
      role: "Senior Backend Systems Engineer",
      isPrivate: false,
    },
  });

  let shortlistCandidate = await prisma.shortlistCandidate.findFirst({
    where: { shortlistId: shortlist.id, candidateId: talentUser.id },
  });
  if (!shortlistCandidate) {
    shortlistCandidate = await prisma.shortlistCandidate.create({
      data: {
        shortlistId: shortlist.id,
        candidateId: talentUser.id,
        stage: RecruiterStage.SCREENING,
        matchReason: "Demonstrated production capability through verified Apex project completion.",
        relevantSkills: "TypeScript, PostgreSQL, Distributed Systems",
      },
    });

    await prisma.candidateNote.create({
      data: {
        shortlistCandidateId: shortlistCandidate.id,
        authorId: recruiterUser.id,
        note: "Alex completed our audit pipeline project with stellar code review. Fast-tracking to technical loop.",
      },
    });
  }

  // 9. MENTORSHIP ECOSYSTEM
  await prisma.mentorProfile.upsert({
    where: { userId: mentorUser.id },
    update: {
      expertise: "Distributed Systems, Architecture, Seed Scaling",
      industries: "DevTools, Infrastructure, Enterprise SaaS",
      availability: "2 sessions/week (Tuesdays & Thursdays)",
      mentoringFormat: "1:1 Architecture Advisory",
      isVerified: true,
      topics: "Systems design, high availability, early startup tech debt avoidance.",
    },
    create: {
      userId: mentorUser.id,
      expertise: "Distributed Systems, Architecture, Seed Scaling",
      industries: "DevTools, Infrastructure, Enterprise SaaS",
      experienceYears: 14,
      availability: "2 sessions/week (Tuesdays & Thursdays)",
      mentoringFormat: "1:1 Architecture Advisory",
      isVerified: true,
      topics: "Systems design, high availability, early startup tech debt avoidance.",
    },
  });

  // Mentorship Request & Session with Alex Rivera
  let reqTalent = await prisma.mentorshipRequest.findFirst({
    where: { mentorId: mentorUser.id, menteeId: talentUser.id },
  });
  if (!reqTalent) {
    reqTalent = await prisma.mentorshipRequest.create({
      data: {
        mentorId: mentorUser.id,
        menteeId: talentUser.id,
        topic: "Transitioning from Senior Contributor to Distributed Systems Architect",
        goals: "Hi Dr. Chen, I'd love your feedback on state synchronization patterns.",
        status: "ACCEPTED",
      },
    });

    await prisma.mentorshipSession.create({
      data: {
        requestId: reqTalent.id,
        mentorId: mentorUser.id,
        menteeId: talentUser.id,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 28),
        durationMinutes: 45,
        status: "SCHEDULED",
        actionItems: "Prepare architecture diagram for event replay engine.",
      },
    });
  }

  // Mentorship Session with Elena Rostova
  let reqFounder = await prisma.mentorshipRequest.findFirst({
    where: { mentorId: mentorUser.id, menteeId: founderUser.id },
  });
  if (!reqFounder) {
    reqFounder = await prisma.mentorshipRequest.create({
      data: {
        mentorId: mentorUser.id,
        menteeId: founderUser.id,
        topic: "Venture Architecture & Technical Hiring Loop",
        goals: "Reviewing our technical evaluation framework for the founding engineering role.",
        status: "ACCEPTED",
      },
    });

    await prisma.mentorshipSession.create({
      data: {
        requestId: reqFounder.id,
        mentorId: mentorUser.id,
        menteeId: founderUser.id,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 52),
        durationMinutes: 45,
        status: "SCHEDULED",
        notes: "Focus on vetting full-stack candidates via evidence rather than whiteboard puzzles.",
      },
    });
  }

  // 10. COMMUNITY & HACKATHON
  const community = await prisma.community.upsert({
    where: { slug: "builders-hackers-guild" },
    update: {
      name: "Builders & Hackers Guild",
      description: "Global community of engineers, designers, and founders building verifiable prototypes.",
      category: "Ecosystem Builders",
    },
    create: {
      slug: "builders-hackers-guild",
      name: "Builders & Hackers Guild",
      description: "Global community of engineers, designers, and founders building verifiable prototypes.",
      category: "Ecosystem Builders",
      creatorId: organizerUser.id,
    },
  });

  // Memberships
  for (const u of [organizerUser, talentUser, mentorUser, founderUser]) {
    const isOwner = u.id === organizerUser.id;
    await prisma.communityMember.upsert({
      where: { id: `cm-${community.id}-${u.id}` },
      update: {},
      create: {
        id: `cm-${community.id}-${u.id}`,
        communityId: community.id,
        userId: u.id,
        role: isOwner ? "ADMIN" : "MEMBER",
      },
    });
  }

  // Community Post
  const existingPost = await prisma.communityPost.findFirst({
    where: { communityId: community.id, authorId: organizerUser.id },
  });
  if (!existingPost) {
    const post = await prisma.communityPost.create({
      data: {
        communityId: community.id,
        authorId: organizerUser.id,
        title: "Announcing Orbit Global Hackathon 2025: Build Proof-of-Work Solutions",
        content: "Registration is open! Build verifiable projects across Web, AI, and Distributed Systems tracks.",
        category: "ANNOUNCEMENT",
      },
    });

    await prisma.communityComment.create({
      data: {
        postId: post.id,
        authorId: talentUser.id,
        content: "Looking forward to presenting our team's project at demo day!",
      },
    });
  }

  // Hackathon Event
  let hackathon = await prisma.event.findFirst({
    where: { title: "Orbit Global Hackathon 2025" },
  });
  if (!hackathon) {
    hackathon = await prisma.event.create({
      data: {
        title: "Orbit Global Hackathon 2025",
        organizerName: "Builders & Hackers Guild",
        description: "48-hour global hackathon focused on evidence-backed open-source infrastructure.",
        type: "HACKATHON",
        format: "HYBRID",
        city: "San Francisco & Global Online",
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9),
      },
    });

    // Registration
    await prisma.eventRegistration.create({
      data: {
        eventId: hackathon.id,
        userId: talentUser.id,
      },
    });
  }

  // 11. MESSAGES & CONVERSATIONS
  const convId = `conv-${recruiterUser.id}-${talentUser.id}`;
  const conv = await prisma.conversation.upsert({
    where: { id: convId },
    update: {},
    create: {
      id: convId,
      isGroup: false,
    },
  });

  await prisma.conversationMember.upsert({
    where: { conversationId_userId: { conversationId: conv.id, userId: recruiterUser.id } },
    update: {},
    create: { conversationId: conv.id, userId: recruiterUser.id },
  });
  await prisma.conversationMember.upsert({
    where: { conversationId_userId: { conversationId: conv.id, userId: talentUser.id } },
    update: {},
    create: { conversationId: conv.id, userId: talentUser.id },
  });

  const existingMsg = await prisma.message.findFirst({ where: { conversationId: conv.id } });
  if (!existingMsg) {
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: recruiterUser.id,
        content: "Hi Alex, we reviewed your verified work record on the Apex audit pipeline. We'd love to discuss the Senior Backend role.",
      },
    });
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: talentUser.id,
        content: "Thank you Marcus! The project was an exciting challenge. I'd be glad to walk through the architecture.",
      },
    });
  }

  // 12. NOTIFICATIONS
  await prisma.notification.createMany({
    data: [
      {
        userId: talentUser.id,
        type: NotificationType.APPLICATION_STATUS,
        title: "Application Shortlisted",
        body: "Elena Rostova shortlisted your application for Full-Stack Software Engineer at Aether Dynamics.",
        link: "/opportunities",
      },
      {
        userId: talentUser.id,
        type: NotificationType.VERIFICATION_UPDATE,
        title: "Work Record Verified",
        body: "David Sterling verified your work record for Distributed Audit & Event Ingestion Pipeline.",
        link: "/verified-work",
      },
      {
        userId: founderUser.id,
        type: NotificationType.APPLICATION_STATUS,
        title: "New Qualified Candidate",
        body: "Alex Rivera applied to Full-Stack Software Engineer (Founding Team).",
        link: "/opportunities",
      },
      {
        userId: mentorUser.id,
        type: NotificationType.EVENT_REMINDER,
        title: "Advisory Session Scheduled",
        body: "Advisory session with Alex Rivera is scheduled for tomorrow.",
        link: "/mentorship",
      },
    ],
  });

  // 13. ADMIN QUEUES & AUDIT LOGS
  const existingReport = await prisma.report.findFirst({
    where: { reportedById: organizerUser.id },
  });
  if (!existingReport) {
    await prisma.report.create({
      data: {
        reportedById: organizerUser.id,
        reason: "Suspected duplicate opportunity posting",
        details: "Automated alert flagged an opportunity with matching description text.",
        status: ReportStatus.OPEN,
      },
    });
  }

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        action: "ORGANIZATION_VERIFY",
        entityType: "Organization",
        entityId: apexOrg.id,
        metadata: { orgName: "Apex Innovations", verifiedBy: adminUser.email },
      },
      {
        actorId: orgAdminUser.id,
        action: "VERIFIED_WORK_ISSUE",
        entityType: "VerifiedWorkRecord",
        entityId: auditProject.id,
        metadata: { recipient: talentUser.email, projectTitle: auditProject.title },
      },
    ],
  });

  console.log("--------------------------------------------------");
  console.log("DEMO ECOSYSTEM SEEDING COMPLETED SUCCESSFULLY");
  console.log("Password for all demo accounts: " + DEMO_PASSWORD);
  console.log("--------------------------------------------------");
}

if (require.main === module) {
  seedDemoData()
    .catch((err) => {
      console.error("Seeding error:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
