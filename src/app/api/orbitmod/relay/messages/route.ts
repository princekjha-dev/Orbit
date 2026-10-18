import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { sendChatMessage } from "@/lib/relay/relay-service";
import { z } from "zod";

const messageSchema = z.object({
  channelId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const message = await sendChatMessage({
      channelId: parsed.data.channelId,
      senderId: user.id,
      senderName: user.name || user.email || user.id,
      content: parsed.data.content,
    });

    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 400 });
  }
}
