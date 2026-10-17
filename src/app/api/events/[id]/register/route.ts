import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId: id, userId: session.user.id! } },
    update: {},
    create: { eventId: id, userId: session.user.id! },
  });
  return NextResponse.json({ saved: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.eventRegistration.deleteMany({
    where: { eventId: id, userId: session.user.id! },
  });
  return NextResponse.json({ saved: false });
}
