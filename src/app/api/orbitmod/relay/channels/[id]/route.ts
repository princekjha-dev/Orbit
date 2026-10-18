import { NextRequest, NextResponse } from "next/server";
import { getChannelMessages } from "@/lib/relay/relay-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const messages = await getChannelMessages(id);
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve channel messages" }, { status: 500 });
  }
}
