import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/automation/executions - audit trail of rule executions
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const executions = await prisma.automationExecution.findMany({
      include: {
        rule: { select: { title: true, triggerEvent: true, actionType: true } },
      },
      orderBy: { executedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ executions });
  } catch (error) {
    console.error("Error fetching automation executions:", error);
    return NextResponse.json(
      { error: "Failed to fetch executions" },
      { status: 500 }
    );
  }
}
