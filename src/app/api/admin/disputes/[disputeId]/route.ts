import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ disputeId: string }> }) {
  const { disputeId } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { action } = await req.json();
  const newStatus = action === "resolve" ? "RESOLVED" : "CLOSED";
  await prisma.dispute.update({
    where: { id: disputeId },
    data: { status: newStatus, resolvedAt: new Date(), resolvedBy: session.user.id! },
  });
  return NextResponse.json({ status: newStatus });
}
