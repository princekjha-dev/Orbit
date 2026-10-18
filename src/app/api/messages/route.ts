import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

// POST /api/messages — start a new DM
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const { participantId } = await req.json();
  if (!participantId) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "participantId is required" } },
      { status: 400 }
    );
  }

  // Check if DM already exists
  const existing = await safeDbCall(
    () =>
      prisma.conversation.findFirst({
        where: {
          isGroup: false,
          members: {
            every: {
              userId: { in: [user.id!, participantId] },
            },
          },
          AND: [
            { members: { some: { userId: user.id! } } },
            { members: { some: { userId: participantId } } },
          ],
        },
      }),
    null
  );

  if (existing) {
    return NextResponse.json({ success: true, id: existing.id });
  }

  const conv = await safeDbCall(
    () =>
      prisma.conversation.create({
        data: {
          isGroup: false,
          members: {
            create: [{ userId: user.id! }, { userId: participantId }],
          },
        },
      }),
    { id: `conv-${user.id}-${participantId}` } as any
  );

  return NextResponse.json({ success: true, id: conv?.id }, { status: 201 });
}
