import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createSafetyReport, getSafetyReports } from "@/lib/relay/relay-service";
import { z } from "zod";

const reportSchema = z.object({
  targetType: z.enum(["OPPORTUNITY", "USER", "ORGANIZATION", "MESSAGE"]),
  targetId: z.string().min(1),
  category: z.enum([
    "OFF_PLATFORM_SOLICITATION",
    "MISLEADING_OPPORTUNITY",
    "IMPERSONATION_RISK",
    "UNPAID_TRIAL_WORK",
    "HARASSMENT",
  ]),
  explanation: z.string().min(10),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await getSafetyReports();
    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve safety reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const report = await createSafetyReport({
      reporterId: user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      category: parsed.data.category,
      explanation: parsed.data.explanation,
    });

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit safety report" }, { status: 400 });
  }
}
