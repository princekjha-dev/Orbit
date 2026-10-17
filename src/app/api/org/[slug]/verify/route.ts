import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organization.findFirst({
    where: {
      slug,
      members: { some: { userId: session.user.id!, role: { in: ["OWNER", "ADMIN"] } } },
    },
  });
  if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.organizationVerification.findFirst({
    where: { organizationId: org.id, status: "PENDING" },
  });
  if (existing) return NextResponse.json({ error: "Verification already pending" }, { status: 409 });

  const { notes, evidenceUrl } = await req.json();

  await prisma.organizationVerification.create({
    data: {
      organizationId: org.id,
      notes: notes || null,
      evidenceUrl: evidenceUrl || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ submitted: true }, { status: 201 });
}
