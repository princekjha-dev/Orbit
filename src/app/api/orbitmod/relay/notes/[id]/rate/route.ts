import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { rateCommunityNote } from "@/lib/relay/relay-service";
import { z } from "zod";

const rateSchema = z.object({
  rating: z.enum(["HELPFUL", "SOMEWHAT_HELPFUL", "NOT_HELPFUL"]),
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
    const parsed = rateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid rating", details: parsed.error.issues }, { status: 400 });
    }

    const updatedNote = await rateCommunityNote({
      noteId: id,
      raterId: user.id,
      rating: parsed.data.rating,
    });

    return NextResponse.json(updatedNote);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to rate Community Note" }, { status: 400 });
  }
}
