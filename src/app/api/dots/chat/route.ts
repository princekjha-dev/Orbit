import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { processDotInteraction, DotId } from "@/lib/ai/dot-agent";
import { formatGroqApiError } from "@/lib/ai/groq/errors";
import { z } from "zod";

const chatRequestSchema = z.object({
  dotId: z.enum(["avis", "scout", "quill", "relay"]),
  message: z.string().min(1, "Message cannot be empty").max(2000),
  confirmationAction: z
    .object({
      action: z.string(),
      payload: z.any(),
      confirmed: z.boolean(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to converse with Orbit Dots.",
          },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid chat request",
          },
        },
        { status: 400 }
      );
    }

    const { dotId, message, confirmationAction } = parsed.data;

    const result = await processDotInteraction({
      dotId: dotId as DotId,
      userId: user.id || "guest",
      userName: user.name || "Member",
      message,
      confirmationAction,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    console.error("[dot chat error]", err);
    const { response, statusCode } = formatGroqApiError(err);
    return NextResponse.json(response, { status: statusCode });
  }
}
