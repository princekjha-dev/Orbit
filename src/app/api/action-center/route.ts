import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/action-center - aggregate real actionable tasks
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [
      storedItems,
      identityVerification,
      userOrgs,
      mentorshipRequests,
      activeProjects,
      savedOpps,
    ] = await Promise.all([
      prisma.actionItem.findMany({
        where: { userId: user.id, isResolved: false },
        orderBy: { createdAt: "desc" },
      }),
      prisma.identityVerification.findUnique({
        where: { userId: user.id },
      }),
      prisma.organizationMember.findMany({
        where: { userId: user.id },
        include: {
          organization: {
            include: {
              opportunities: {
                where: { isActive: true },
                include: {
                  applications: { where: { status: "APPLIED" } },
                },
              },
            },
          },
        },
      }),
      prisma.mentorshipRequest.findMany({
        where: { mentorId: user.id, status: "REQUESTED" },
      }),
      prisma.projectApplication.findMany({
        where: { userId: user.id, status: "ACCEPTED" },
        include: {
          project: {
            select: { id: true, title: true, deadline: true, health: true },
          },
        },
      }),
      prisma.savedOpportunity.findMany({
        where: { userId: user.id },
        include: {
          opportunity: { select: { id: true, title: true, deadline: true } },
        },
      }),
    ]);

    const actions: {
      id: string;
      title: string;
      description: string;
      actionUrl: string;
      priority: "HIGH" | "NORMAL" | "LOW";
      category: string;
      createdAt: string;
    }[] = [];

    // 1. Stored Action Items
    for (const item of storedItems) {
      actions.push({
        id: item.id,
        title: item.title,
        description: item.description,
        actionUrl: item.actionUrl,
        priority: item.priority,
        category: "System Task",
        createdAt: item.createdAt.toISOString(),
      });
    }

    // 2. Organization applications requiring review
    for (const om of userOrgs) {
      let pendingCount = 0;
      for (const opp of om.organization.opportunities) {
        pendingCount += opp.applications.length;
      }
      if (pendingCount > 0) {
        actions.push({
          id: `org-review-${om.organizationId}`,
          title: `Review ${pendingCount} pending application${pendingCount > 1 ? "s" : ""}`,
          description: `Candidates have applied to open opportunities at ${om.organization.name}. Review their evidence and advance qualified talent.`,
          actionUrl: `/recruiter/workspace`,
          priority: "HIGH",
          category: "Organization Hiring",
          createdAt: now.toISOString(),
        });
      }
    }

    // 3. Mentorship requests pending response
    if (mentorshipRequests.length > 0) {
      actions.push({
        id: "mentorship-pending",
        title: `Respond to ${mentorshipRequests.length} mentorship request${mentorshipRequests.length > 1 ? "s" : ""}`,
        description: "Peers on Orbit have requested mentorship sessions with you.",
        actionUrl: "/growth",
        priority: "NORMAL",
        category: "Mentorship",
        createdAt: now.toISOString(),
      });
    }

    // 4. Project deliverables due soon
    for (const pa of activeProjects) {
      if (pa.project.deadline) {
        const d = new Date(pa.project.deadline);
        if (d > now && d <= threeDaysLater) {
          actions.push({
            id: `proj-due-${pa.project.id}`,
            title: `Deliverable due for "${pa.project.title}"`,
            description: `Project deadline is approaching on ${d.toLocaleDateString()}. Ensure all scoped deliverables are submitted for review.`,
            actionUrl: `/projects/${pa.project.id}`,
            priority: "HIGH",
            category: "Project Work",
            createdAt: now.toISOString(),
          });
        }
      }
    }

    // 5. Identity Verification prompt (if unverified)
    if (!identityVerification || identityVerification.status === "UNVERIFIED") {
      actions.push({
        id: "verify-identity",
        title: "Optional: Complete Identity Verification",
        description: "Verify your legal identity with Orbit to receive a verified contributor badge.",
        actionUrl: "/settings",
        priority: "LOW",
        category: "Account Trust",
        createdAt: now.toISOString(),
      });
    }

    // 6. Saved opportunity closing soon
    for (const saved of savedOpps) {
      if (saved.opportunity.deadline) {
        const d = new Date(saved.opportunity.deadline);
        if (d > now && d <= threeDaysLater) {
          actions.push({
            id: `saved-closing-${saved.opportunity.id}`,
            title: `Saved opportunity "${saved.opportunity.title}" closing soon`,
            description: `Applications close on ${d.toLocaleDateString()}. Submit your application before the window expires.`,
            actionUrl: `/opportunities/${saved.opportunity.id}`,
            priority: "NORMAL",
            category: "Opportunities",
            createdAt: now.toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      actions,
      totalCount: actions.length,
      highPriorityCount: actions.filter((a) => a.priority === "HIGH").length,
    });
  } catch (error) {
    console.error("Error fetching action center tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch action center tasks" },
      { status: 500 }
    );
  }
}
