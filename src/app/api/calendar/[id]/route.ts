import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();

  safeDbCall(() =>
    prisma.calendarEvent.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        isCompleted: typeof body.isCompleted === "boolean" ? body.isCompleted : undefined,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime !== undefined ? (body.endTime ? new Date(body.endTime) : null) : undefined,
        link: body.link !== undefined ? body.link : undefined,
      },
    })
  );

  return NextResponse.json({ success: true, event: { id, ...body } });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  safeDbCall(() => prisma.calendarEvent.delete({ where: { id } }));

  return NextResponse.json({ success: true });
}
