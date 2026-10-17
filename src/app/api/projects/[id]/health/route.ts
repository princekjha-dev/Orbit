import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { ProjectHealthStatus } from "@prisma/client";

// PATCH /api/projects/[id]/health - update project health status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify organization membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: user.id,
        },
      },
    });

    if (!membership && (user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { health } = body;

    if (!health || !Object.values(ProjectHealthStatus).includes(health)) {
      return NextResponse.json({ error: "Invalid health status" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { health: health as ProjectHealthStatus },
    });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error("Error updating project health:", error);
    return NextResponse.json(
      { error: "Failed to update project health" },
      { status: 500 }
    );
  }
}
