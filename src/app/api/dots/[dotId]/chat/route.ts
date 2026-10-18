import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { processDotInteraction, DotId } from "@/lib/ai/dot-agent";
import { formatGroqApiError } from "@/lib/ai/groq/errors";
import { inMemoryStore } from "@/lib/database/in-memory-store";
import { z } from "zod";

const VALID_DOTS: DotId[] = ["atlas", "scout", "forge", "signal", "avis", "quill", "relay"];

const dotChatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message exceeds 2000 characters limit"),
  conversationId: z.string().optional(),
  confirmationAction: z
    .object({
      action: z.string(),
      payload: z.any(),
      confirmed: z.boolean(),
    })
    .optional(),
});

// Simple rate limiter tracking requests per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (record.count >= 20) {
    return false;
  }
  record.count++;
  return true;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ dotId: string }> }
) {
  try {
    const { dotId } = await params;

    // 1. Validate Dot exists
    if (!VALID_DOTS.includes(dotId as DotId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Orbit Dot '${dotId}' not found. Available Dots: avis, scout, quill, relay.`,
          },
        },
        { status: 404 }
      );
    }

    // 2. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to converse with Orbit Dots.",
          },
        },
        { status: 401 }
      );
    }

    // 3. Rate limiting check
    if (!checkRateLimit(user.id || "guest")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "You have exceeded the maximum of 20 Dot requests per minute. Please wait a moment.",
            retryable: true,
          },
        },
        { status: 429 }
      );
    }

    // 4. Validate payload
    const body = await req.json();
    const parsed = dotChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid chat request format.",
          },
        },
        { status: 400 }
      );
    }

    const { message, conversationId, confirmationAction } = parsed.data;

    // 5. Authorization: If conversationId is provided, verify ownership
    if (conversationId && inMemoryStore.dotConversations.has(conversationId)) {
      const conv = inMemoryStore.dotConversations.get(conversationId)!;
      if (conv.userId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Access denied to this Dot conversation.",
            },
          },
          { status: 403 }
        );
      }
    }

    // 6. Execute interaction through multi-agent orchestrator with Groq
    const result = await processDotInteraction({
      dotId: dotId as DotId,
      userId: user.id || "guest",
      userName: user.name || "Member",
      message,
      conversationId,
      confirmationAction,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    console.error("[Groq Dot Chat Error]", err);
    const { response, statusCode } = formatGroqApiError(err);
    return NextResponse.json(response, { status: statusCode });
  }
}
