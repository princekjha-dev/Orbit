import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";
import { resolveStartup, verifyStartupAccess } from "@/lib/startups/service";

// GET /api/startups/[slug]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const startup = await resolveStartup(slug);

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    return NextResponse.json({ startup });
  } catch (error) {
    console.error("Error fetching startup:", error);
    return NextResponse.json({ error: "Failed to fetch startup" }, { status: 500 });
  }
}

// PATCH /api/startups/[slug]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const startup = await resolveStartup(slug);

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    if (!verifyStartupAccess(startup as any, user.id, (user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, problem, solution, industry, stage, location, website, requiredSkills } = body;

    // Update in-memory store
    const stored = inMemoryStore.startups.get(slug) || inMemoryStore.startups.get(startup.id);
    if (stored) {
      if (name) stored.name = name;
      if (description) stored.description = description;
      if (problem) stored.problem = problem;
      if (solution) stored.solution = solution;
      if (industry) stored.industry = industry;
      if (stage) stored.stage = stage;
      if (location !== undefined) stored.location = location;
      if (website !== undefined) stored.website = website;
      if (requiredSkills !== undefined) stored.requiredSkills = requiredSkills;
      stored.updatedAt = new Date().toISOString();
    }

    // Update Prisma if available
    try {
      const updated = await prisma.startup.update({
        where: { id: startup.id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(problem && { problem }),
          ...(solution && { solution }),
          ...(industry && { industry }),
          ...(stage && { stage }),
          ...(location !== undefined && { location }),
          ...(website !== undefined && { website }),
          ...(requiredSkills !== undefined && { requiredSkills }),
        },
      });
      return NextResponse.json({ startup: updated, success: true });
    } catch {
      // Fallback
    }

    return NextResponse.json({ startup: stored || startup, success: true });
  } catch (error) {
    console.error("Error updating startup:", error);
    return NextResponse.json({ error: "Failed to update startup" }, { status: 500 });
  }
}
