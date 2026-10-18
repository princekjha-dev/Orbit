import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { applyOpportunitySchema } from "@/lib/validation/schemas";
import { inMemoryStore, StoredApplication } from "@/lib/database/in-memory-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to apply." } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = applyOpportunitySchema.safeParse(body);
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

    // Check if opportunity exists in DB or fallback catalog
    const opportunity = await safeDbCall(
      () =>
        prisma.opportunity.findUnique({
          where: { id, isActive: true, isDeleted: false },
        }),
      { id, title: "Opportunity", deadline: null } as any
    );

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Opportunity not found or closed" } },
        { status: 404 }
      );
    }

    if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: { code: "DEADLINE_PASSED", message: "Application deadline has passed" } },
        { status: 400 }
      );
    }

    // Check existing application in DB or in-memory
    const existingKey = `${id}:${user.id}`;
    if (inMemoryStore.applications.has(existingKey)) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_APPLIED", message: "You have already applied for this opportunity" } },
        { status: 409 }
      );
    }

    const existingDb = await safeDbCall(
      () =>
        prisma.opportunityApplication.findUnique({
          where: { opportunityId_userId: { opportunityId: id, userId: user.id! } },
        }),
      null
    );

    if (existingDb) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_APPLIED", message: "You have already applied for this opportunity" } },
        { status: 409 }
      );
    }

    const newAppId = `app-${Date.now()}`;
    const storedApp: StoredApplication = {
      id: newAppId,
      opportunityId: id,
      userId: user.id!,
      coverLetter: parsed.data.coverLetter,
      portfolioUrl: parsed.data.portfolioUrl || null,
      status: "APPLIED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryStore.applications.set(existingKey, storedApp);

    // Also persist to DB if reachable
    safeDbCall(() =>
      prisma.opportunityApplication.create({
        data: {
          id: newAppId,
          opportunityId: id,
          userId: user.id!,
          coverLetter: parsed.data.coverLetter,
          portfolioUrl: parsed.data.portfolioUrl || null,
          status: "APPLIED",
        },
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: { id: newAppId, status: "APPLIED" },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[apply opportunity]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error?.message || "Internal server error" } },
      { status: 500 }
    );
  }
}
