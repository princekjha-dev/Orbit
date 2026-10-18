import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { respondToTeamInvite } from "@/lib/scout/scout-service";
import { z } from "zod";

const respondSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action", details: parsed.error.issues }, { status: 400 });
    }

    const userId = user.id;
    const updatedInvite = await respondToTeamInvite({
      inviteId: id,
      candidateId: userId,
      action: parsed.data.action,
    });

    return NextResponse.json(updatedInvite);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to respond to invitation" }, { status: 400 });
  }
}
