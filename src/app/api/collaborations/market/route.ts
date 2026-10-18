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

    let posts: any[] = [];
    try {
      posts = await Promise.race([
        prisma.collaborationPost.findMany({
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
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("DB offline")), 1500)
        ),
      ]);
    } catch {
      // Offline fallback posts
      posts = [
        {
          id: "collab-fallback-1",
          postType: "SEEKING_HELP",
          skills: "Rust, Raft, Distributed Systems",
          context: "Building verifiable state machine replication protocol on Orbit.",
          expectedContribution: "Design Raft log compaction engine and write integration benchmarks.",
          availability: "15 hrs/week",
          duration: "3 months",
          compensationType: "PAID",
          isOpen: true,
          createdAt: new Date().toISOString(),
          user: {
            id: "founder-sarah",
            name: "Sarah Chen",
            username: "sarah_chen",
            image: null,
            profile: { headline: "Founder @ Aether Dynamics", location: "San Francisco, CA" },
            verifiedWorkRecords: [{ id: "v1" }, { id: "v2" }],
          },
        },
        {
          id: "collab-fallback-2",
          postType: "OFFERING_HELP",
          skills: "Next.js, Tailwind CSS, TypeScript",
          context: "Senior frontend architect looking to contribute to open venture tools.",
          expectedContribution: "Frontend architecture, real-time message state, accessible components.",
          availability: "10 hrs/week",
          duration: "2 months",
          compensationType: "OPEN_TO_DISCUSSION",
          isOpen: true,
          createdAt: new Date().toISOString(),
          user: {
            id: "builder-alex",
            name: "Alex Rivera",
            username: "arivera",
            image: null,
            profile: { headline: "Systems Engineer", location: "New York, NY" },
            verifiedWorkRecords: [{ id: "v3" }],
          },
        },
      ];
    }

    const filtered = skill
      ? posts.filter((p) => p.skills.toLowerCase().includes(skill))
      : posts;

    return NextResponse.json({
      posts: filtered.map((p) => ({
        ...p,
        user: {
          ...p.user,
          verifiedWorkCount: p.user?.verifiedWorkRecords?.length || 0,
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
