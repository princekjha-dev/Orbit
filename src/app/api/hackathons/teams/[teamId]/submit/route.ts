import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

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

  const submissionId = `sub-${Date.now()}`;

  // Update in-memory store
  const team = inMemoryStore.hackathonTeams.get(teamId);
  if (team) {
    team.submissionTitle = parsed.data.title;
    team.submissionUrl = parsed.data.githubUrl || parsed.data.demoUrl;
    team.submittedAt = new Date().toISOString();
  }

  safeDbCall(() =>
    prisma.hackathonSubmission.create({
      data: {
        id: submissionId,
        teamId,
        title: parsed.data.title,
        description: parsed.data.description,
        githubUrl: parsed.data.githubUrl || null,
        demoUrl: parsed.data.demoUrl || null,
        videoUrl: parsed.data.videoUrl || null,
      },
    })
  );

  return NextResponse.json({ success: true, id: submissionId }, { status: 201 });
}
