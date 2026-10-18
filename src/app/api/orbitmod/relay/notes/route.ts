import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createCommunityNote, getCommunityNotes } from "@/lib/relay/relay-service";
import { z } from "zod";

const createNoteSchema = z.object({
  targetEntityType: z.enum(["OPPORTUNITY", "ORGANIZATION", "USER_PROFILE"]),
  targetEntityId: z.string().min(1),
  content: z.string().min(10),
  evidenceLinks: z.array(z.string().url()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType") as any;
    const entityId = searchParams.get("entityId") || undefined;

    const notes = await getCommunityNotes(entityType, entityId);
    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const note = await createCommunityNote({
      targetEntityType: parsed.data.targetEntityType,
      targetEntityId: parsed.data.targetEntityId,
      authorId: user.id,
      content: parsed.data.content,
      evidenceLinks: parsed.data.evidenceLinks || [],
    });

    return NextResponse.json(note);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create Community Note" }, { status: 400 });
  }
}
