import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { evaluateSubmission } from "@/lib/quill/quill-service";
import { z } from "zod";

const evaluateSchema = z.object({
  submissionId: z.string().min(1),
  scores: z.array(
    z.object({
      criterionId: z.string().min(1),
      score: z.number().min(1).max(5),
      feedbackNotes: z.string().optional(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = evaluateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const result = await evaluateSubmission({
      submissionId: parsed.data.submissionId,
      reviewerId: user.id,
      reviewerName: user.name || user.email || user.id,
      scores: parsed.data.scores,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit evaluation" }, { status: 400 });
  }
}
