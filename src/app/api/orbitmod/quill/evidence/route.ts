import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createVerifiableEvidence } from "@/lib/quill/quill-service";
import { z } from "zod";

const createEvidenceSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  linkedSkillIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createEvidenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const artifact = await createVerifiableEvidence({
      authorId: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      linkedSkillIds: parsed.data.linkedSkillIds || [],
    });

    return NextResponse.json(artifact);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create evidence artifact" }, { status: 400 });
  }
}
