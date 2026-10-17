import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action } = await req.json();
  const newStatus = action === "resolve" ? "RESOLVED" : "DISMISSED";

  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { status: newStatus, resolvedAt: new Date(), resolvedBy: session.user.id! },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id!,
        action: `report_${action}`,
        entityType: "Report",
        entityId: reportId,
      },
    }),
  ]);

  return NextResponse.json({ status: newStatus });
}
