import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { submitAssessmentSolution } from "@/lib/quill/quill-service";
import { z } from "zod";

const submitSchema = z.object({
  assessmentId: z.string().min(1),
  artifactContent: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const submission = await submitAssessmentSolution({
      assessmentId: parsed.data.assessmentId,
      candidateId: user.id,
      candidateName: user.name || user.email || user.id,
      artifactContent: parsed.data.artifactContent,
    });

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit assessment" }, { status: 400 });
  }
}
