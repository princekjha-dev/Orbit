import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { OutcomeType } from "@prisma/client";

// GET /api/evidence/records
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId") || user.id;
    const isOwner = targetUserId === user.id;

    const records = await prisma.outcomeRecord.findMany({
      where: {
        userId: targetUserId,
        ...(isOwner ? {} : { isPublic: true }),
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching outcome records:", error);
    return NextResponse.json(
      { error: "Failed to fetch outcome records" },
      { status: 500 }
    );
  }
}

// POST /api/evidence/records
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      title,
      activity,
      organizationName,
      organizationId,
      date,
      participants,
      deliverableUrl,
      evidenceUrl,
      reviewText,
      isPublic = true,
    } = body;

    if (!type || !title || !activity) {
      return NextResponse.json(
        { error: "type, title, and activity are required" },
        { status: 400 }
      );
    }

    const record = await prisma.outcomeRecord.create({
      data: {
        userId: user.id,
        type: type as OutcomeType,
        title: title.trim(),
        activity: activity.trim(),
        organizationName: organizationName?.trim() || null,
        organizationId: organizationId || null,
        date: date ? new Date(date) : new Date(),
        participants: participants?.trim() || null,
        deliverableUrl: deliverableUrl?.trim() || null,
        evidenceUrl: evidenceUrl?.trim() || null,
        reviewText: reviewText?.trim() || null,
        isPublic: Boolean(isPublic),
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Error creating outcome record:", error);
    return NextResponse.json(
      { error: "Failed to create outcome record" },
      { status: 500 }
    );
  }
}
