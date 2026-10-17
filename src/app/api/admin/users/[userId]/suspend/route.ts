import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { suspend } = await req.json();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isSuspended: suspend },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id!,
        action: suspend ? "user_suspend" : "user_unsuspend",
        entityType: "User",
        entityId: userId,
      },
    }),
  ]);

  return NextResponse.json({ suspended: suspend });
}
