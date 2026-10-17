import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// POST /api/messages — start a new DM
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { participantId } = await req.json();
  if (!participantId) return NextResponse.json({ error: "participantId required" }, { status: 400 });

  // Check if DM already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      members: {
        every: {
          userId: { in: [session.user.id!, participantId] },
        },
      },
      AND: [
        { members: { some: { userId: session.user.id! } } },
        { members: { some: { userId: participantId } } },
      ],
    },
  });

  if (existing) return NextResponse.json({ id: existing.id });

  const conv = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: session.user.id! },
          { userId: participantId },
        ],
      },
    },
  });

  return NextResponse.json({ id: conv.id }, { status: 201 });
}
