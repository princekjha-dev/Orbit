import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { resolveStartup, verifyStartupAccess } from "@/lib/startups/service";

// PATCH /api/startups/[slug]/hiring-needs/[id] - toggle open or update
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
    const updated = await prisma.startupHiringNeed.update({
      where: { id },
      data: {
        ...(typeof body.isOpen === "boolean" ? { isOpen: body.isOpen } : {}),
        ...(body.roleTitle ? { roleTitle: body.roleTitle.trim() } : {}),
        ...(body.requiredSkills ? { requiredSkills: body.requiredSkills.trim() } : {}),
        ...(body.compensation !== undefined ? { compensation: body.compensation } : {}),
      },
    });

    return NextResponse.json({ hiringNeed: updated });
  } catch (error) {
    console.error("Error updating hiring need:", error);
    return NextResponse.json(
      { error: "Failed to update hiring need" },
      { status: 500 }
    );
  }
}

// DELETE /api/startups/[slug]/hiring-needs/[id]
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

    await prisma.startupHiringNeed.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hiring need:", error);
    return NextResponse.json(
      { error: "Failed to delete hiring need" },
      { status: 500 }
    );
  }
}
