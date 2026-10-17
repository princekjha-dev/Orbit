import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.calendarEvent.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await req.json();

  const updated = await prisma.calendarEvent.update({
    where: { id },
    data: {
      title: body.title !== undefined ? body.title : undefined,
      description: body.description !== undefined ? body.description : undefined,
      isCompleted: typeof body.isCompleted === "boolean" ? body.isCompleted : undefined,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime !== undefined ? (body.endTime ? new Date(body.endTime) : null) : undefined,
      link: body.link !== undefined ? body.link : undefined,
    },
  });

  return NextResponse.json({ event: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.calendarEvent.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.calendarEvent.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
