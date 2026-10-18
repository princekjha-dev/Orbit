import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { sendTeamInvite } from "@/lib/scout/scout-service";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { z } from "zod";

const inviteSchema = z.object({
  teamId: z.string().min(1),
  candidateId: z.string().min(1),
  roleName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Rate limit: 15 invites per hour
    const allowed = await checkRateLimit(userId, "INVITE");
    if (!allowed) {
      return NextResponse.json({ error: "Too many invitations sent. Please slow down." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const invite = await sendTeamInvite({
      teamId: parsed.data.teamId,
      candidateId: parsed.data.candidateId,
      senderId: userId,
      roleName: parsed.data.roleName,
    });

    return NextResponse.json(invite);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send team invitation" }, { status: 400 });
  }
}
