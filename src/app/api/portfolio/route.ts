import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/portfolio - get current user's portfolio configuration
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - create or update portfolio configuration
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      title,
      bio,
      highlightSkills,
      selectedProjectIds,
      selectedOutcomeIds,
      isPublic = true,
    } = body;

    const cleanSlug = (slug || user.username || `user-${user.id}`)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "");

    // Check slug uniqueness if changed
    const existing = await prisma.portfolio.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing && existing.userId !== user.id) {
      return NextResponse.json(
        { error: "This portfolio URL slug is already taken" },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.upsert({
      where: { userId: user.id },
      update: {
        slug: cleanSlug,
        title: title || `${user.name} - Evidence Portfolio`,
        bio: bio || null,
        highlightSkills: highlightSkills ? JSON.stringify(highlightSkills) : null,
        selectedProjectIds: selectedProjectIds ? JSON.stringify(selectedProjectIds) : null,
        selectedOutcomeIds: selectedOutcomeIds ? JSON.stringify(selectedOutcomeIds) : null,
        isPublic: Boolean(isPublic),
      },
      create: {
        userId: user.id,
        slug: cleanSlug,
        title: title || `${user.name} - Evidence Portfolio`,
        bio: bio || null,
        highlightSkills: highlightSkills ? JSON.stringify(highlightSkills) : null,
        selectedProjectIds: selectedProjectIds ? JSON.stringify(selectedProjectIds) : null,
        selectedOutcomeIds: selectedOutcomeIds ? JSON.stringify(selectedOutcomeIds) : null,
        isPublic: Boolean(isPublic),
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error("Error saving portfolio:", error);
    return NextResponse.json(
      { error: "Failed to save portfolio" },
      { status: 500 }
    );
  }
}
