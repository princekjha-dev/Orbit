import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const team = await prisma.hackathonTeam.findUnique({ where: { id: teamId } });
  if (!team || !team.isOpen) return NextResponse.json({ error: "Team not open" }, { status: 400 });

  const existing = await prisma.hackathonMember.findUnique({
    where: { teamId_userId: { teamId, userId: session.user.id! } },
  });
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  await prisma.hackathonMember.create({
    data: { teamId, userId: session.user.id!, role: "MEMBER" },
  });

  return NextResponse.json({ joined: true });
}
