import { NextRequest, NextResponse } from "next/server";
import { searchSkillsTaxonomy } from "@/lib/quill/quill-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const skills = await searchSkillsTaxonomy(query);
    return NextResponse.json({ skills });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to search skills" }, { status: 500 });
  }
}
