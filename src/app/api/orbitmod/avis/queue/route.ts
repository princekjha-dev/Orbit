import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { can } from "@/lib/auth/permissions";
import { getReviewQueue, getAvisMetrics } from "@/lib/avis/avis-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must have platform moderation / admin permissions to view review queue
    if (!can(user, "VERIFY_ORGANIZATION") && !can(user, "MODERATE_PLATFORM")) {
      return NextResponse.json({ error: "Forbidden: Review queue requires administrator privileges" }, { status: 403 });
    }

    const [queue, metrics] = await Promise.all([
      getReviewQueue(),
      getAvisMetrics(),
    ]);

    return NextResponse.json({ queue, metrics });
  } catch (error: any) {
    console.error("Avis queue fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to load review queue" }, { status: 500 });
  }
}
