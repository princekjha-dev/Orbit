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
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const saveKey = `${user.id}:${id}`;
  inMemoryStore.savedOpportunities.add(saveKey);

  safeDbCall(() =>
    prisma.savedOpportunity.upsert({
      where: { opportunityId_userId: { opportunityId: id, userId: user.id! } },
      update: {},
      create: { opportunityId: id, userId: user.id! },
    })
  );

  return NextResponse.json({ success: true, saved: true });
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

  const saveKey = `${user.id}:${id}`;
  inMemoryStore.savedOpportunities.delete(saveKey);

  safeDbCall(() =>
    prisma.savedOpportunity.deleteMany({
      where: { opportunityId: id, userId: user.id! },
    })
  );

  return NextResponse.json({ success: true, saved: false });
}
