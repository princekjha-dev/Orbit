import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { inMemoryStore, StoredStartupMilestone } from "@/lib/database/in-memory-store";
import { resolveStartup, verifyStartupAccess } from "@/lib/startups/service";

// GET /api/startups/[slug]/milestones
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

    try {
      const milestones = await prisma.startupMilestone.findMany({
        where: { startupId: startup.id },
        orderBy: { createdAt: "asc" },
      });
      if (milestones && milestones.length > 0) {
        return NextResponse.json({ milestones });
      }
    } catch {
      // fallback
    }

    const stored = inMemoryStore.startups.get(slug) || inMemoryStore.startups.get(startup.id);
    return NextResponse.json({ milestones: stored?.milestones || (startup as any).milestones || [] });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

// POST /api/startups/[slug]/milestones
export async function POST(
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
    const { title, description, dueDate, status = "PLANNED" } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const milestoneId = `ms-${Date.now()}`;
    const newMilestone: StoredStartupMilestone = {
      id: milestoneId,
      startupId: startup.id,
      title,
      description: description || null,
      dueDate: dueDate || null,
      status: status as any,
      createdAt: new Date().toISOString(),
    };

    const stored = inMemoryStore.startups.get(slug) || inMemoryStore.startups.get(startup.id);
    if (stored) {
      stored.milestones.push(newMilestone);
    }

    try {
      const dbMilestone = await prisma.startupMilestone.create({
        data: {
          startupId: startup.id,
          title,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: status as any,
        },
      });
      return NextResponse.json({ milestone: dbMilestone, success: true }, { status: 201 });
    } catch {
      // fallback
    }

    return NextResponse.json({ milestone: newMilestone, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}

// PATCH /api/startups/[slug]/milestones
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
    const { milestoneId, status, title, description } = body;

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required" }, { status: 400 });
    }

    const stored = inMemoryStore.startups.get(slug) || inMemoryStore.startups.get(startup.id);
    if (stored) {
      const found = stored.milestones.find((m) => m.id === milestoneId);
      if (found) {
        if (status) found.status = status;
        if (title) found.title = title;
        if (description !== undefined) found.description = description;
      }
    }

    try {
      const updated = await prisma.startupMilestone.update({
        where: { id: milestoneId },
        data: {
          ...(status && { status }),
          ...(title && { title }),
          ...(description !== undefined && { description }),
        },
      });
      return NextResponse.json({ milestone: updated, success: true });
    } catch {
      // fallback
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}
