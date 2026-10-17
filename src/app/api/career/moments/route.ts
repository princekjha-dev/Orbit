import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

const careerMomentTypeEnum = z.enum([
  "FIRST_PROJECT",
  "FIRST_INTERNSHIP",
  "FIRST_PAID_PROJECT",
  "FIRST_HACKATHON",
  "FIRST_STARTUP",
  "FIRST_VERIFIED_WORK",
  "FIRST_MENTORSHIP",
  "FIRST_JOB",
]);

const createMomentSchema = z.object({
  momentType: careerMomentTypeEnum,
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
  date: z.string().optional(),
  referenceId: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// GET /api/career/moments - Get user career moments + detect eligible moments from actual records
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch existing recorded moments
    const recordedMoments = await prisma.careerMoment.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    const recordedTypes = new Set(recordedMoments.map((m) => m.momentType));

    // 2. Discover eligible moments from real Orbit records
    const eligibleDetected: Array<{
      momentType: z.infer<typeof careerMomentTypeEnum>;
      title: string;
      description: string;
      date: Date;
      referenceId?: string;
    }> = [];

    // First Project
    if (!recordedTypes.has("FIRST_PROJECT")) {
      const firstProjectApp = await prisma.projectApplication.findFirst({
        where: { userId: user.id, status: "ACCEPTED" },
        include: { project: true },
        orderBy: { appliedAt: "asc" },
      });
      if (firstProjectApp && firstProjectApp.project) {
        eligibleDetected.push({
          momentType: "FIRST_PROJECT",
          title: `First Project: ${firstProjectApp.project.title}`,
          description: `Joined as a contributor on ${firstProjectApp.project.title}.`,
          date: firstProjectApp.appliedAt,
          referenceId: firstProjectApp.projectId,
        });
      }
    }

    // First Hackathon
    if (!recordedTypes.has("FIRST_HACKATHON")) {
      const firstHackathon = await prisma.hackathonMember.findFirst({
        where: { userId: user.id },
        include: { team: true },
        orderBy: { joinedAt: "asc" },
      });
      if (firstHackathon && firstHackathon.team) {
        eligibleDetected.push({
          momentType: "FIRST_HACKATHON",
          title: `First Hackathon: ${firstHackathon.team.name}`,
          description: `Competed with hackathon team ${firstHackathon.team.name}.`,
          date: firstHackathon.joinedAt,
          referenceId: firstHackathon.team.id,
        });
      }
    }

    // First Startup
    if (!recordedTypes.has("FIRST_STARTUP")) {
      const firstStartup = await prisma.startup.findFirst({
        where: { creatorId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (firstStartup) {
        eligibleDetected.push({
          momentType: "FIRST_STARTUP",
          title: `Founded Startup: ${firstStartup.name}`,
          description: `Initiated venture: ${firstStartup.description || firstStartup.name}.`,
          date: firstStartup.createdAt,
          referenceId: firstStartup.id,
        });
      }
    }

    // First Verified Work
    if (!recordedTypes.has("FIRST_VERIFIED_WORK")) {
      const firstWork = await prisma.verifiedWorkRecord.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (firstWork) {
        eligibleDetected.push({
          momentType: "FIRST_VERIFIED_WORK",
          title: `First Verified Work: ${firstWork.projectTitle}`,
          description: `Verified completion of ${firstWork.projectTitle}.`,
          date: firstWork.createdAt,
          referenceId: firstWork.id,
        });
      }
    }

    // First Mentorship
    if (!recordedTypes.has("FIRST_MENTORSHIP")) {
      const firstSession = await prisma.mentorshipSession.findFirst({
        where: {
          OR: [{ mentorId: user.id }, { menteeId: user.id }],
          status: "COMPLETED",
        },
        orderBy: { scheduledAt: "asc" },
      });
      if (firstSession) {
        eligibleDetected.push({
          momentType: "FIRST_MENTORSHIP",
          title: `First Mentorship Session`,
          description: `Completed 1-on-1 mentorship session on Orbit.`,
          date: firstSession.scheduledAt,
          referenceId: firstSession.id,
        });
      }
    }

    return NextResponse.json({
      recordedMoments,
      eligibleDetected,
    });
  } catch (error) {
    console.error("GET /api/career/moments error:", error);
    return NextResponse.json({ error: "Failed to fetch career moments" }, { status: 500 });
  }
}

// POST /api/career/moments - Record a career moment
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createMomentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const { momentType, title, description, date, referenceId, isPublic } = parsed.data;

    const moment = await prisma.careerMoment.create({
      data: {
        userId: user.id,
        momentType,
        title,
        description,
        date: date ? new Date(date) : new Date(),
        referenceId,
        isPublic,
      },
    });

    return NextResponse.json({ moment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/career/moments error:", error);
    return NextResponse.json({ error: "Failed to create career moment" }, { status: 500 });
  }
}
