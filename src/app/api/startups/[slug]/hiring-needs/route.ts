import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { WorkMode } from "@prisma/client";
import { resolveStartup, verifyStartupAccess } from "@/lib/startups/service";

// GET /api/startups/[slug]/hiring-needs
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

    const hiringNeeds = await prisma.startupHiringNeed.findMany({
      where: { startupId: startup.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ hiringNeeds });
  } catch (error) {
    console.error("Error fetching hiring needs:", error);
    return NextResponse.json(
      { error: "Failed to fetch hiring needs" },
      { status: 500 }
    );
  }
}

// POST /api/startups/[slug]/hiring-needs
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
    const { roleTitle, requiredSkills, context, whyHiring, workMode = "REMOTE", compensation } = body;

    if (!roleTitle || !requiredSkills || !whyHiring) {
      return NextResponse.json(
        { error: "roleTitle, requiredSkills, and whyHiring are required" },
        { status: 400 }
      );
    }

    const hiringNeed = await prisma.startupHiringNeed.create({
      data: {
        startupId: startup.id,
        roleTitle: roleTitle.trim(),
        requiredSkills: requiredSkills.trim(),
        context: context?.trim() || "Early-stage startup role",
        whyHiring: whyHiring.trim(),
        workMode: workMode as WorkMode,
        compensation: compensation?.trim() || null,
        isOpen: true,
      },
    });

    return NextResponse.json({ hiringNeed }, { status: 201 });
  } catch (error) {
    console.error("Error creating hiring need:", error);
    return NextResponse.json(
      { error: "Failed to create hiring need" },
      { status: 500 }
    );
  }
}
