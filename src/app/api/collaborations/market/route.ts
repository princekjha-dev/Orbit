import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { CollabPostType, CollabCompensationType } from "@prisma/client";

// GET /api/collaborations/market
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postType = searchParams.get("postType");
    const compensationType = searchParams.get("compensationType");
    const skill = searchParams.get("skill")?.toLowerCase();

    const posts = await prisma.collaborationPost.findMany({
      where: {
        isOpen: true,
        ...(postType ? { postType: postType as CollabPostType } : {}),
        ...(compensationType ? { compensationType: compensationType as CollabCompensationType } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            profile: {
              select: { headline: true, location: true },
            },
            verifiedWorkRecords: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const filtered = skill
      ? posts.filter((p) => p.skills.toLowerCase().includes(skill))
      : posts;

    return NextResponse.json({
      posts: filtered.map((p) => ({
        ...p,
        user: {
          ...p.user,
          verifiedWorkCount: p.user.verifiedWorkRecords.length,
        },
      })),
      total: filtered.length,
    });
  } catch (error) {
    console.error("Error fetching collaboration market:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaboration market" },
      { status: 500 }
    );
  }
}

// POST /api/collaborations/market
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      postType,
      skills,
      context,
      expectedContribution,
      availability,
      duration,
      compensationType,
    } = body;

    if (
      !postType ||
      !skills ||
      !context ||
      !expectedContribution ||
      !availability ||
      !duration ||
      !compensationType
    ) {
      return NextResponse.json(
        { error: "All structured collaboration fields are required" },
        { status: 400 }
      );
    }

    const post = await prisma.collaborationPost.create({
      data: {
        userId: user.id,
        postType: postType as CollabPostType,
        skills: skills.trim(),
        context: context.trim(),
        expectedContribution: expectedContribution.trim(),
        availability: availability.trim(),
        duration: duration.trim(),
        compensationType: compensationType as CollabCompensationType,
        isOpen: true,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating collaboration post:", error);
    return NextResponse.json(
      { error: "Failed to create collaboration post" },
      { status: 500 }
    );
  }
}
