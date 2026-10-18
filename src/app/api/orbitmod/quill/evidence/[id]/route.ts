import { NextRequest, NextResponse } from "next/server";
import { getEvidenceArtifact } from "@/lib/quill/quill-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { artifact, isValidIntegrity } = await getEvidenceArtifact(id);

    if (!artifact) {
      return NextResponse.json({ error: "Evidence artifact not found" }, { status: 404 });
    }

    return NextResponse.json({ artifact, isValidIntegrity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve evidence artifact" }, { status: 500 });
  }
}
