import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { calculateScoutMatch } from "@/lib/scout/matching-engine";
import { z } from "zod";

const matchSchema = z.object({
  candidate: z.object({
    id: z.string(),
    name: z.string(),
    skills: z.array(z.object({
      name: z.string(),
      level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
      verified: z.boolean().optional(),
    })),
    availabilityHoursPerWeek: z.number().min(0).max(168),
    rolesInterested: z.array(z.string()),
    timezoneOffsetHours: z.number().min(-12).max(14),
    evidenceCount: z.number().min(0),
    discoveryStatus: z.enum(["ACTIVE", "PASSIVE", "OFF"]),
  }),
  opportunity: z.object({
    id: z.string(),
    title: z.string(),
    organizationName: z.string(),
    requiredSkills: z.array(z.string()),
    preferredSkills: z.array(z.string()).optional(),
    targetHoursPerWeek: z.number().min(1).max(80),
    targetRole: z.string(),
    targetTimezoneOffsetHours: z.number().min(-12).max(14).optional(),
    maxTimezoneDeltaHours: z.number().min(1).max(24).optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = matchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const match = calculateScoutMatch(parsed.data.candidate, parsed.data.opportunity);
    return NextResponse.json(match);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate match" }, { status: 500 });
  }
}
