import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDotHistory, DotId } from "@/lib/ai/dot-agent";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dotId: string }> }
) {
  try {
    const { dotId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to view Dot history",
          },
        },
        { status: 401 }
      );
    }

    if (!["atlas", "scout", "forge", "signal", "avis", "quill", "relay"].includes(dotId.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Unknown Dot ID" },
        },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const conversationId = searchParams.get("conversationId") || undefined;

    const history = getDotHistory(user.id || "guest", dotId as DotId, conversationId);

    return NextResponse.json({
      success: true,
      data: { history, conversationId: conversationId || `${user.id}:${dotId}` },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: err?.message || "Failed to load history" },
      },
      { status: 500 }
    );
  }
}
