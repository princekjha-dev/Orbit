import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createDnsChallenge, verifyOrganizationDns } from "@/lib/avis/avis-service";
import { z } from "zod";

const createChallengeSchema = z.object({
  organizationId: z.string().min(1),
  domain: z.string().min(3),
});

const verifyChallengeSchema = z.object({
  organizationId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Verification check request
    if (body.action === "VERIFY") {
      const parsed = verifyChallengeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request payload", details: parsed.error.issues }, { status: 400 });
      }

      const result = await verifyOrganizationDns(parsed.data.organizationId);
      return NextResponse.json(result);
    }

    // Challenge generation request
    const parsed = createChallengeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsed.error.issues }, { status: 400 });
    }

    const challenge = await createDnsChallenge(parsed.data.organizationId, parsed.data.domain);
    return NextResponse.json({ challenge });
  } catch (error: any) {
    console.error("DNS challenge route error:", error);
    return NextResponse.json({ error: error.message || "Failed to process DNS challenge" }, { status: 500 });
  }
}
