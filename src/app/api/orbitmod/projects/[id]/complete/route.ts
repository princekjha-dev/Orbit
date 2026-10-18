import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { completeProjectAndAttest } from "@/lib/passport/passport-service";
import { z } from "zod";

const completeSchema = z.object({
  summary: z.string().min(10),
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
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const attestation = await completeProjectAndAttest({
      teamId: id,
      completerId: user.id,
      summary: parsed.data.summary,
    });

    return NextResponse.json(attestation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to complete project" }, { status: 400 });
  }
}
