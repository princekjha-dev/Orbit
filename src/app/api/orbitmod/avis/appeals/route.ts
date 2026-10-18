import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { submitVerificationAppeal } from "@/lib/avis/avis-service";
import { z } from "zod";

const appealSchema = z.object({
  recordId: z.string().min(1),
  reason: z.string().min(15, "Please provide comprehensive context for this appeal"),
  evidenceUrls: z.array(z.string().url()).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = appealSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid appeal payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const appeal = await submitVerificationAppeal({
      recordId: parsed.data.recordId,
      requesterId: user.id || user.email || "user",
      reason: parsed.data.reason,
      evidenceUrls: parsed.data.evidenceUrls || [],
    });

    return NextResponse.json({ success: true, appeal });
  } catch (error: any) {
    console.error("Avis appeal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit appeal" },
      { status: 500 }
    );
  }
}
