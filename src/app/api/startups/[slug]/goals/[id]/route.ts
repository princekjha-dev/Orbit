import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { GoalStatus } from "@prisma/client";
import { resolveStartup, verifyStartupAccess } from "@/lib/startups/service";

// PATCH /api/startups/[slug]/goals/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await params;
    const startup = await resolveStartup(slug);

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    if (!verifyStartupAccess(startup, user.id, (user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.startupGoal.update({
      where: { id },
      data: {
        ...(body.status && Object.values(GoalStatus).includes(body.status)
          ? { status: body.status as GoalStatus }
          : {}),
        ...(body.milestones !== undefined ? { milestones: body.milestones } : {}),
        ...(body.title ? { title: body.title.trim() } : {}),
      },
    });

    return NextResponse.json({ goal: updated });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

// DELETE /api/startups/[slug]/goals/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await params;
    const startup = await resolveStartup(slug);

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    if (!verifyStartupAccess(startup, user.id, (user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.startupGoal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
