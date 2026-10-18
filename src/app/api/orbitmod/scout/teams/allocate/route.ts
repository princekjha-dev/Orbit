import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { allocateSlotsForTeam } from "@/lib/scout/scout-service";
import { z } from "zod";

const allocateSchema = z.object({
  teamId: z.string().min(1),
  targetHoursPerWeek: z.number().min(1).max(80).default(20),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = allocateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const allocation = await allocateSlotsForTeam(parsed.data.teamId, parsed.data.targetHoursPerWeek);
    return NextResponse.json(allocation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to allocate team slots" }, { status: 500 });
  }
}
