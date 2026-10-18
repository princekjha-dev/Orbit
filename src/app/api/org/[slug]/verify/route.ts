import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const { notes, evidenceUrl } = await req.json();

  safeDbCall(async () => {
    const org = await prisma.organization.findFirst({
      where: { slug },
    });
    if (org) {
      await prisma.organizationVerification.create({
        data: {
          organizationId: org.id,
          notes: notes || null,
          evidenceUrl: evidenceUrl || null,
          status: "PENDING",
        },
      });
    }
  });

  return NextResponse.json({ success: true, submitted: true }, { status: 201 });
}
