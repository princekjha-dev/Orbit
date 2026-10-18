import { PrismaClient } from "@prisma/client";
import { seedDemoData } from "./seed-demo";

// Load environment variables if running outside Next.js
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env");
  } catch {
    // .env may not exist or already loaded
  }
}

const prisma = new PrismaClient();

async function resetDemoData() {
  console.log("--------------------------------------------------");
  console.log("ORBIT: Resetting demo ecosystem");
  console.log("--------------------------------------------------");

  // Safety guard against production destruction
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_RESET !== "true") {
    console.error("FATAL ERROR: Demo reset is disallowed in production without explicit ALLOW_DEMO_RESET=true");
    process.exit(1);
  }

  // 1. Identify demo users
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@orbit.demo" } },
    select: { id: true, email: true },
  });

  const demoUserIds = demoUsers.map((u) => u.id);

  if (demoUserIds.length > 0) {
    console.log(`Found ${demoUserIds.length} existing demo user accounts.`);

    // Remove demo conversations & messages
    await prisma.message.deleteMany({
      where: { senderId: { in: demoUserIds } },
    });
    await prisma.conversationMember.deleteMany({
      where: { userId: { in: demoUserIds } },
    });

    // Remove demo notifications
    await prisma.notification.deleteMany({
      where: { userId: { in: demoUserIds } },
    });

    // Remove demo applications & projects
    await prisma.opportunityApplication.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.projectApplication.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.verifiedWorkRecord.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.skillEvidence.deleteMany({
      where: { userId: { in: demoUserIds } },
    });

    // Remove demo mentorship data
    await prisma.mentorshipSession.deleteMany({
      where: { OR: [{ mentorId: { in: demoUserIds } }, { menteeId: { in: demoUserIds } }] },
    });
    await prisma.mentorshipRequest.deleteMany({
      where: { OR: [{ mentorId: { in: demoUserIds } }, { menteeId: { in: demoUserIds } }] },
    });
    await prisma.mentorProfile.deleteMany({
      where: { userId: { in: demoUserIds } },
    });

    // Remove demo community & event records
    await prisma.communityMember.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.eventRegistration.deleteMany({
      where: { userId: { in: demoUserIds } },
    });

    // Remove demo organizations & startups
    await prisma.organizationMember.deleteMany({
      where: { userId: { in: demoUserIds } },
    });

    // Remove users
    await prisma.profile.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: demoUserIds } },
    });

    console.log("Cleared prior demo user records.");
  }

  // Delete demo organizations by slug
  await prisma.organization.deleteMany({
    where: { slug: { in: ["apex-innovations", "aether-dynamics-org", "astra-digital", "nexora-labs", "india-builders-network"] } },
  });

  // Delete demo startup by slug
  await prisma.startup.deleteMany({
    where: { slug: { in: ["aether-dynamics", "nexora-labs"] } },
  });

  // Delete demo community by slug
  await prisma.community.deleteMany({
    where: { slug: { in: ["builders-hackers-guild", "ai-builders-india"] } },
  });

  // Re-seed freshly
  await seedDemoData();
}

if (require.main === module) {
  resetDemoData()
    .catch((err) => {
      console.error("Reset demo failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
