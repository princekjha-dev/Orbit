import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { inMemoryStore, StoredStartup } from "@/lib/database/in-memory-store";
import { listStartups } from "@/lib/startups/service";

// GET /api/startups
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") || undefined;
    const stage = searchParams.get("stage") || undefined;
    const search = searchParams.get("search") || undefined;

    const startups = await listStartups({ industry, stage, search });
    return NextResponse.json({ startups });
  } catch (error) {
    console.error("Error listing startups:", error);
    return NextResponse.json({ error: "Failed to list startups" }, { status: 500 });
  }
}

// POST /api/startups
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      problem,
      solution,
      industry = "Technology",
      stage = "IDEA",
      location,
      website,
      requiredSkills,
    } = body;

    if (!name || !description || !problem || !solution) {
      return NextResponse.json(
        { error: "Missing required startup fields (name, description, problem, solution)" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!slug) slug = `startup-${Date.now().toString(36)}`;

    const startupId = `startup-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const storedStartup: StoredStartup = {
      id: startupId,
      slug,
      name,
      logo: null,
      description,
      problem,
      solution,
      industry,
      stage,
      location: location || "Remote",
      website: website || null,
      requiredSkills: requiredSkills || null,
      creatorId: user.id,
      createdAt: nowIso,
      updatedAt: nowIso,
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          startupId,
          title: "Initial Product Spec & Architecture",
          description: "Establish core product roadmap, user flows, and infrastructure plan.",
          dueDate: new Date(Date.now() + 3600000 * 24 * 14).toISOString(),
          status: "IN_PROGRESS",
          createdAt: nowIso,
        },
      ],
      tasks: [
        {
          id: `tk-${Date.now()}-1`,
          startupId,
          title: "Complete foundational setup",
          status: "TODO",
          createdAt: nowIso,
        },
      ],
      hiringNeeds: [],
      members: [
        {
          id: `sm-${Date.now()}`,
          startupId,
          userId: user.id,
          role: "FOUNDER",
          name: (user as any).name || "Founder",
          joinedAt: nowIso,
        },
      ],
    };

    // Save to in-memory store immediately
    inMemoryStore.startups.set(storedStartup.id, storedStartup);
    inMemoryStore.startups.set(storedStartup.slug, storedStartup);

    // Attempt Prisma insertion if database is available
    try {
      const dbStartup = await Promise.race([
        prisma.startup.create({
          data: {
            slug,
            name,
            description,
            problem,
            solution,
            industry,
            stage,
            location: location || null,
            website: website || null,
            requiredSkills: requiredSkills || null,
            creatorId: user.id,
            members: {
              create: {
                userId: user.id,
                role: "FOUNDER",
              },
            },
            milestones: {
              create: {
                title: "Initial Product Spec & Architecture",
                description: "Establish core product roadmap, user flows, and infrastructure plan.",
                status: "IN_PROGRESS",
              },
            },
          },
          include: {
            members: true,
            milestones: true,
          },
        }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Database timeout")), 2000)
        ),
      ]);

      if (dbStartup) {
        return NextResponse.json({ startup: dbStartup, success: true }, { status: 201 });
      }
    } catch {
      // Return in-memory created startup if DB is offline
    }

    return NextResponse.json({ startup: storedStartup, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating startup:", error);
    return NextResponse.json({ error: "Failed to create startup" }, { status: 500 });
  }
}
