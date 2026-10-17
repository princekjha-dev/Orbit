import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.savedOpportunity.upsert({
      where: { opportunityId_userId: { opportunityId: id, userId: session.user.id! } },
      update: {},
      create: { opportunityId: id, userId: session.user.id! },
    });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.savedOpportunity.deleteMany({
      where: { opportunityId: id, userId: session.user.id! },
    });
    return NextResponse.json({ saved: false });
  } catch {
    return NextResponse.json({ error: "Failed to unsave" }, { status: 500 });
  }
}
