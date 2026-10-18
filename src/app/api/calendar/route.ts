import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  type: z.enum([
    "PROJECT_MILESTONE",
    "EVENT_REGISTRATION",
    "MENTORSHIP_SESSION",
    "HACKATHON_DEADLINE",
    "APPLICATION_DEADLINE",
    "PERSONAL_TASK",
  ]).default("PERSONAL_TASK"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  isAllDay: z.boolean().default(false),
  link: z.string().url().optional().or(z.literal("")),
});

function aggregateCalendarItems(params: any): any[] {
  const aggregated: any[] = [];
  const { customEvents, projectApps, registeredEvents, mentorshipSessions, startupMemberships, typeFilter, userId } = params;

  if (customEvents) {
    for (const ev of customEvents) {
      aggregated.push({
        id: ev.id,
        title: ev.title,
        description: ev.description,
        type: ev.type,
        startTime: ev.startTime.toISOString(),
        endTime: ev.endTime ? ev.endTime.toISOString() : null,
        isAllDay: ev.isAllDay,
        link: ev.link,
        isCompleted: ev.isCompleted,
        isEditable: true,
        source: "USER",
      });
    }
  }

  if (registeredEvents) {
    for (const reg of registeredEvents) {
      if (reg.event) {
        aggregated.push({
          id: `evt-${reg.event.id}`,
          title: `Event: ${reg.event.title}`,
          description: `Format: ${reg.event.format}`,
          type: "EVENT_REGISTRATION",
          startTime: new Date(reg.event.startDate).toISOString(),
          endTime: reg.event.endDate ? new Date(reg.event.endDate).toISOString() : null,
          isAllDay: false,
          link: `/events/${reg.event.id}`,
          isCompleted: false,
          isEditable: false,
          source: "EVENT",
        });
      }
    }
  }

  aggregated.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  return aggregated;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const userId = user.id;
  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type");

  const customEvents = await safeDbCall(
    () =>
      prisma.calendarEvent.findMany({
        where: {
          userId,
          ...(typeFilter && typeFilter !== "ALL" ? { type: typeFilter as any } : {}),
        },
        orderBy: { startTime: "asc" },
      }),
    []
  );

  const registeredEvents = await safeDbCall(
    () =>
      prisma.eventRegistration.findMany({
        where: { userId },
        include: {
          event: {
            select: { id: true, title: true, startDate: true, endDate: true, format: true },
          },
        },
      }),
    []
  );

  const events = aggregateCalendarItems({
    customEvents,
    registeredEvents,
    typeFilter,
    userId,
  });

  return NextResponse.json({ success: true, events });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createEventSchema.parse(body);

    const eventId = `cal-${Date.now()}`;
    const newEvent = {
      id: eventId,
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      type: parsed.type,
      startTime: new Date(parsed.startTime),
      endTime: parsed.endTime ? new Date(parsed.endTime) : null,
      isAllDay: parsed.isAllDay,
      link: parsed.link || null,
      isCompleted: false,
    };

    safeDbCall(() =>
      prisma.calendarEvent.create({
        data: newEvent as any,
      })
    );

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: err.issues[0]?.message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: err.message || "Failed to create event" } },
      { status: 500 }
    );
  }
}
