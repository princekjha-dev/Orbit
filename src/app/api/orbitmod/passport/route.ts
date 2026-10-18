import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getEvidencePassport } from "@/lib/passport/passport-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "candidate-alex-chen";

    const passport = await getEvidencePassport(userId);
    return NextResponse.json(passport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve evidence passport" }, { status: 500 });
  }
}
