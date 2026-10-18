import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore, StoredHackathonTeam } from "@/lib/database/in-memory-store";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().optional(),
  projectIdea: z.string().optional(),
  rolesNeeded: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  hackathonId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Validation error",
        },
      },
      { status: 400 }
    );
  }

  const teamId = `team-${Date.now()}`;
  const storedTeam: StoredHackathonTeam = {
    id: teamId,
    hackathonId: parsed.data.hackathonId || "default-hackathon",
    name: parsed.data.name,
    description: parsed.data.description || "",
    leaderId: user.id!,
    members: [{ userId: user.id!, name: user.name || "Leader", role: "OWNER" }],
    createdAt: new Date().toISOString(),
  };

  inMemoryStore.hackathonTeams.set(teamId, storedTeam);

  safeDbCall(() =>
    prisma.hackathonTeam.create({
      data: {
        id: teamId,
        name: parsed.data.name,
        description: parsed.data.description,
        projectIdea: parsed.data.projectIdea,
        rolesNeeded: parsed.data.rolesNeeded,
        githubUrl: parsed.data.githubUrl || null,
        isOpen: true,
        members: {
          create: { userId: user.id!, role: "OWNER" },
        },
      },
    })
  );

  return NextResponse.json({ success: true, id: teamId }, { status: 201 });
}
