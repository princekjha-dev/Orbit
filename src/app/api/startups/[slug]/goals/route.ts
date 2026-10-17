import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { GoalStatus } from "@prisma/client";
import { resolveStartup, verifyStartupAccess } from "@/lib/startups/service";

// GET /api/startups/[slug]/goals
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

    const goals = await prisma.startupGoal.findMany({
      where: { startupId: startup.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Error fetching startup goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST /api/startups/[slug]/goals
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

    if (!verifyStartupAccess(startup, user.id, (user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, targetQuarter, status = "PLANNED", milestones, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const goal = await prisma.startupGoal.create({
      data: {
        startupId: startup.id,
        title: title.trim(),
        description: description?.trim() || null,
        targetQuarter: targetQuarter?.trim() || null,
        status: status as GoalStatus,
        milestones: milestones || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating startup goal:", error);
    return NextResponse.json(
      { error: "Failed to create startup goal" },
      { status: 500 }
    );
  }
}
