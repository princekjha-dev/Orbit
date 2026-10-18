import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  // Check in-memory store
  const team = inMemoryStore.hackathonTeams.get(teamId);
  if (team) {
    const isMember = team.members.some((m) => m.userId === user.id);
    if (isMember) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_MEMBER", message: "Already a member" } },
        { status: 409 }
      );
    }
    team.members.push({ userId: user.id!, name: user.name || "Member", role: "MEMBER" });
  }

  safeDbCall(() =>
    prisma.hackathonMember.create({
      data: { teamId, userId: user.id!, role: "MEMBER" },
    })
  );

  return NextResponse.json({ success: true, joined: true });
}
