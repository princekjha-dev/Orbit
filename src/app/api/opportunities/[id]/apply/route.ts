import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { applyOpportunitySchema } from "@/lib/validation/schemas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = applyOpportunitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id, isActive: true, isDeleted: false },
    });
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found or closed" }, { status: 404 });
    }

    if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) {
      return NextResponse.json({ error: "Application deadline has passed" }, { status: 400 });
    }

    const existing = await prisma.opportunityApplication.findUnique({
      where: { opportunityId_userId: { opportunityId: id, userId: session.user.id! } },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already applied" }, { status: 409 });
    }

    const application = await prisma.opportunityApplication.create({
      data: {
        opportunityId: id,
        userId: session.user.id!,
        coverLetter: parsed.data.coverLetter,
        portfolioUrl: parsed.data.portfolioUrl || null,
        status: "APPLIED",
      },
    });

    return NextResponse.json({ id: application.id }, { status: 201 });
  } catch (error) {
    console.error("[apply opportunity]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
