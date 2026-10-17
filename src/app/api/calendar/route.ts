import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  description: z.string().max(1000).optional(),
  type: z.enum([
    "INTERVIEW",
    "APPLICATION_DEADLINE",
    "PROJECT_DEADLINE",
    "EVENT",
    "HACKATHON",
    "TEAM_MEETING",
    "MENTORSHIP_SESSION",
    "REMINDER",
    "STARTUP_MILESTONE",
  ]).default("REMINDER"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  isAllDay: z.boolean().default(false),
  link: z.string().url().optional().or(z.literal("")),
});

interface CalendarAggregationParams {
  customEvents: any[];
  projectApps: any[];
  registeredEvents: any[];
  mentorshipSessions: any[];
  startupMemberships: any[];
  typeFilter: string | null;
  userId: string;
}

function aggregateCalendarItems({
  customEvents,
  projectApps,
  registeredEvents,
  mentorshipSessions,
  startupMemberships,
  typeFilter,
  userId,
}: CalendarAggregationParams) {
  const aggregated: any[] = customEvents.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.type,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime?.toISOString() || null,
    isAllDay: e.isAllDay,
    isCompleted: e.isCompleted,
    link: e.link,
    isEditable: true,
    source: "PERSONAL",
  }));

  if (!typeFilter || typeFilter === "ALL" || typeFilter === "PROJECT_DEADLINE") {
    for (const pa of projectApps) {
      if (pa.project.deadline) {
        aggregated.push({
          id: `project-${pa.project.id}`,
          title: `Project Deadline: ${pa.project.title}`,
          description: `Deliverable milestone deadline`,
          type: "PROJECT_DEADLINE",
          startTime: pa.project.deadline.toISOString(),
          endTime: null,
          isAllDay: true,
          isCompleted: false,
          link: `/projects/${pa.project.id}`,
          isEditable: false,
          source: "PROJECT",
        });
      }
    }
  }

  if (!typeFilter || typeFilter === "ALL" || typeFilter === "EVENT") {
    for (const re of registeredEvents) {
      aggregated.push({
        id: `event-${re.event.id}`,
        title: re.event.title,
        description: `Format: ${re.event.format}`,
        type: "EVENT",
        startTime: re.event.startDate.toISOString(),
        endTime: re.event.endDate?.toISOString() || null,
        isAllDay: false,
        isCompleted: false,
        link: `/events/${re.event.id}`,
        isEditable: false,
        source: "EVENT",
      });
    }
  }

  if (!typeFilter || typeFilter === "ALL" || typeFilter === "MENTORSHIP_SESSION") {
    for (const ms of mentorshipSessions) {
      const partner = ms.mentorId === userId ? ms.mentee.name : ms.mentor.name;
      aggregated.push({
        id: `mentor-${ms.id}`,
        title: `Advisory Session: ${ms.request?.topic || "1:1 Guidance"}`,
        description: `With ${partner}`,
        type: "MENTORSHIP_SESSION",
        startTime: ms.scheduledAt.toISOString(),
        endTime: new Date(ms.scheduledAt.getTime() + ms.durationMinutes * 60000).toISOString(),
        isAllDay: false,
        isCompleted: ms.status === "COMPLETED",
        link: ms.meetingLink || `/mentorship`,
        isEditable: false,
        source: "MENTORSHIP",
      });
    }
  }

  if (!typeFilter || typeFilter === "ALL" || typeFilter === "STARTUP_MILESTONE") {
    for (const sm of startupMemberships) {
      for (const m of sm.startup.milestones) {
        if (m.dueDate) {
          aggregated.push({
            id: `milestone-${m.id}`,
            title: `[${sm.startup.name}] ${m.title}`,
            description: m.description || "",
            type: "STARTUP_MILESTONE",
            startTime: m.dueDate.toISOString(),
            endTime: null,
            isAllDay: true,
            isCompleted: m.status === "COMPLETED",
            link: `/startups/${sm.startup.slug}/workspace`,
            isEditable: false,
            source: "STARTUP",
          });
        }
      }
    }
  }

  aggregated.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  return aggregated;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type");

  // Fetch custom calendar events
  const customEvents = await prisma.calendarEvent.findMany({
    where: {
      userId,
      ...(typeFilter && typeFilter !== "ALL" ? { type: typeFilter as any } : {}),
    },
    orderBy: { startTime: "asc" },
  });

  // Fetch project deadlines
  const projectApps = await prisma.projectApplication.findMany({
    where: { userId, status: "ACCEPTED", project: { deadline: { not: null } } },
    include: { project: { select: { id: true, title: true, deadline: true } } },
  });

  // Fetch registered events
  const registeredEvents = await prisma.eventRegistration.findMany({
    where: { userId },
    include: { event: { select: { id: true, title: true, startDate: true, endDate: true, format: true } } },
  });

  // Fetch mentorship sessions
  const mentorshipSessions = await prisma.mentorshipSession.findMany({
    where: {
      OR: [{ mentorId: userId }, { menteeId: userId }],
      status: { in: ["SCHEDULED", "COMPLETED"] },
    },
    include: {
      mentor: { select: { name: true } },
      mentee: { select: { name: true } },
      request: { select: { topic: true } },
    },
  });

  // Fetch startup milestones
  const startupMemberships = await prisma.startupMember.findMany({
    where: { userId },
    include: {
      startup: {
        include: {
          milestones: { where: { dueDate: { not: null } } },
        },
      },
    },
  });

  const events = aggregateCalendarItems({
    customEvents,
    projectApps,
    registeredEvents,
    mentorshipSessions,
    startupMemberships,
    typeFilter,
    userId,
  });

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createEventSchema.parse(body);

    const event = await prisma.calendarEvent.create({
      data: {
        userId: session.user.id,
        title: parsed.title,
        description: parsed.description || null,
        type: parsed.type,
        startTime: new Date(parsed.startTime),
        endTime: parsed.endTime ? new Date(parsed.endTime) : null,
        isAllDay: parsed.isAllDay,
        link: parsed.link || null,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create event" }, { status: 500 });
  }
}
