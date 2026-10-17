import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { AutomationTrigger, AutomationAction } from "@prisma/client";

// GET /api/automation/rules - list automation rules for current user or their orgs
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId") || user.id;

    const rules = await prisma.automationRule.findMany({
      where: { ownerId },
      include: {
        _count: { select: { executions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Error fetching automation rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch automation rules" },
      { status: 500 }
    );
  }
}

// POST /api/automation/rules - create new deterministic automation rule
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ownerId = user.id, triggerEvent, actionType, title, conditions, actionConfig } = body;

    if (!triggerEvent || !actionType || !title) {
      return NextResponse.json(
        { error: "triggerEvent, actionType, and title are required" },
        { status: 400 }
      );
    }

    const rule = await prisma.automationRule.create({
      data: {
        ownerId,
        triggerEvent: triggerEvent as AutomationTrigger,
        actionType: actionType as AutomationAction,
        title: title.trim(),
        conditions: conditions || null,
        actionConfig: actionConfig || null,
        isActive: true,
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Error creating automation rule:", error);
    return NextResponse.json(
      { error: "Failed to create automation rule" },
      { status: 500 }
    );
  }
}
