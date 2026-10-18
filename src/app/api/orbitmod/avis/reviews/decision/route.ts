import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { canReviewVerification } from "@/lib/auth/orbitmod-permissions";
import { submitReviewerDecision, getVerificationRecord } from "@/lib/avis/avis-service";
import { z } from "zod";

const decisionSchema = z.object({
  recordId: z.string().min(1),
  decision: z.enum(["VERIFY", "REJECT", "SUSPECT"]),
  reason: z.string().min(10, "Reason must be at least 10 characters detailing justification"),
  subjectUserId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = decisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid review decision payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Authorization: Reviewer must possess VERIFY_ORGANIZATION and cannot be the subject
    if (!canReviewVerification(user, parsed.data.subjectUserId)) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to make verification decisions or cannot review your own record" },
        { status: 403 }
      );
    }

    const result = await submitReviewerDecision({
      recordId: parsed.data.recordId,
      reviewerId: user.id || user.email || "admin",
      decision: parsed.data.decision,
      reason: parsed.data.reason,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Avis review decision error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit verification decision" },
      { status: 500 }
    );
  }
}
