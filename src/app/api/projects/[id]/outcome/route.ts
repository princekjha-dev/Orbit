import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { OutcomeType, ProjectStatus, ProjectHealthStatus } from "@prisma/client";

// POST /api/projects/[id]/outcome - record qualitative outcome and complete project
export async function POST(
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
      include: {
        organization: true,
        applications: {
          where: { status: "ACCEPTED" },
          include: { user: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify user is member of project organization
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
    const {
      deliverablesMet = true,
      whatWasDelivered,
      evidenceUrl,
      finalReview,
      qualitativeImpact,
    } = body;

    if (!whatWasDelivered || !finalReview) {
      return NextResponse.json(
        { error: "whatWasDelivered and finalReview are required" },
        { status: 400 }
      );
    }

    // 1. Create or update ProjectOutcome
    const projectOutcome = await prisma.projectOutcome.upsert({
      where: { projectId },
      update: {
        deliverablesMet: Boolean(deliverablesMet),
        whatWasDelivered: whatWasDelivered.trim(),
        evidenceUrl: evidenceUrl?.trim() || null,
        finalReview: finalReview.trim(),
        qualitativeImpact: qualitativeImpact?.trim() || null,
      },
      create: {
        projectId,
        deliverablesMet: Boolean(deliverablesMet),
        whatWasDelivered: whatWasDelivered.trim(),
        evidenceUrl: evidenceUrl?.trim() || null,
        finalReview: finalReview.trim(),
        qualitativeImpact: qualitativeImpact?.trim() || null,
      },
    });

    // 2. Mark project status as COMPLETED and health as COMPLETED
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.COMPLETED,
        health: ProjectHealthStatus.COMPLETED,
      },
    });

    // 3. For each accepted contributor on the project, create an OutcomeRecord
    for (const app of project.applications) {
      await prisma.outcomeRecord.create({
        data: {
          userId: app.userId,
          type: OutcomeType.PROJECT_COMPLETED,
          title: project.title,
          activity: `Completed project: ${project.title}`,
          organizationName: project.organization.name,
          organizationId: project.organizationId,
          deliverableUrl: evidenceUrl?.trim() || null,
          evidenceUrl: evidenceUrl?.trim() || null,
          reviewText: finalReview.trim(),
          isPublic: true,
        },
      });
    }

    return NextResponse.json({ outcome: projectOutcome }, { status: 201 });
  } catch (error) {
    console.error("Error recording project outcome:", error);
    return NextResponse.json(
      { error: "Failed to record project outcome" },
      { status: 500 }
    );
  }
}
