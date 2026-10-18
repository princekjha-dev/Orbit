/**
 * OrbitMod V5 Demo Seed Script
 * Populates realistic test data for the 4 Dots (Avis, Scout, Quill, Relay).
 * ALL records created by this script are explicitly marked as "DEMO / simulated".
 */

import { prisma } from "../src/lib/db";

export const ESCO_SKILL_SUBSET = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Python",
  "SQL",
  "Docker",
  "GraphQL",
  "Tailwind CSS",
  "REST APIs",
  "System Architecture",
  "Product Design",
  "Security Auditing",
  "Figma",
];

export async function seedOrbitModDemo() {
  console.log("🌱 [OrbitMod Seed] Starting demo dataset population (DEMO / simulated)...");

  try {
    // 1. Seed Skills (ESCO subset)
    console.log("... Seeding normalized skill taxonomy");
    for (const skillName of ESCO_SKILL_SUBSET) {
      await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName },
      });
    }

    // 2. Verified Organization
    console.log("... Ensuring verified demo organization");
    const verifiedOrg = await prisma.organization.upsert({
      where: { slug: "apex-innovations-demo" },
      update: {},
      create: {
        name: "Apex Innovations (DEMO / simulated)",
        slug: "apex-innovations-demo",
        website: "https://apexinnovations.org",
        description: "Leading enterprise developer tooling lab (Simulated Demo Organization).",
        verificationStatus: "VERIFIED",
      },
    });

    // 3. Unverified / Pending Organization
    console.log("... Ensuring unverified demo organization");
    const pendingOrg = await prisma.organization.upsert({
      where: { slug: "hypergrowth-stealth-demo" },
      update: {},
      create: {
        name: "HyperGrowth Labs (DEMO / simulated)",
        slug: "hypergrowth-stealth-demo",
        website: "http://hypergrowth-labs-stealth.xyz",
        description: "Early-stage incubation studio seeking engineers (Simulated Demo Organization).",
        verificationStatus: "PENDING",
      },
    });

    // 4. Verified Opportunity
    console.log("... Seeding verified opportunity");
    const fullstackOpp = await prisma.opportunity.upsert({
      where: { id: "demo-opp-fullstack-001" },
      update: {},
      create: {
        id: "demo-opp-fullstack-001",
        organizationId: verifiedOrg.id,
        title: "Full-Stack Security & Platform Intern (DEMO / simulated)",
        type: "INTERNSHIP",
        workMode: "REMOTE",
        description:
          "Work on mission-critical platform security tooling. Requires practical demonstrated proof of TypeScript and SQL. No upfront fees.",
        eligibility: "Open to passionate builders with demonstrated public repositories or Quill artifacts.",
        isActive: true,
        isVerified: true,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    // Connect skills to opportunity
    for (const sName of ["TypeScript", "React", "PostgreSQL"]) {
      const skill = await prisma.skill.findUnique({ where: { name: sName } });
      if (skill) {
        await prisma.opportunitySkill.upsert({
          where: {
            opportunityId_skillId: {
              opportunityId: fullstackOpp.id,
              skillId: skill.id,
            },
          },
          update: {},
          create: {
            opportunityId: fullstackOpp.id,
            skillId: skill.id,
          },
        });
      }
    }

    // 5. Community Space
    console.log("... Ensuring Space for builders");
    await prisma.community.upsert({
      where: { slug: "builders-hub-demo" },
      update: {},
      create: {
        name: "Builders & Founders Hub (DEMO / simulated)",
        slug: "builders-hub-demo",
        description: "General topic Space for project discussions, proof-of-work, and verified opportunities.",
        category: "AI Builders",
        isPrivate: false,
        creatorId: "demo-platform_admin",
      },
    });

    console.log("✅ [OrbitMod Seed] Successfully seeded baseline demo data!");
    return { success: true };
  } catch (err: any) {
    console.warn("⚠️ [OrbitMod Seed] Database connection offline or failed; skipping DB write:", err.message);
    return { success: false, offline: true };
  }
}

if (require.main === module) {
  seedOrbitModDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
