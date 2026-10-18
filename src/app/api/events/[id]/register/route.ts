import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to register for events." } },
      { status: 401 }
    );
  }

  const regKey = `${user.id}:${id}`;
  inMemoryStore.eventRegistrations.set(regKey, {
    id: `reg-${Date.now()}`,
    eventId: id,
    userId: user.id!,
    registeredAt: new Date().toISOString(),
    status: "CONFIRMED",
  });

  safeDbCall(() =>
    prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId: id, userId: user.id! } },
      update: {},
      create: { eventId: id, userId: user.id! },
    })
  );

  return NextResponse.json({ success: true, registered: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const regKey = `${user.id}:${id}`;
  inMemoryStore.eventRegistrations.delete(regKey);

  safeDbCall(() =>
    prisma.eventRegistration.deleteMany({
      where: { eventId: id, userId: user.id! },
    })
  );

  return NextResponse.json({ success: true, registered: false });
}
