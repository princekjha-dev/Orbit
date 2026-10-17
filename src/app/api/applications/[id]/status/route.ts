import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const application = await prisma.opportunityApplication.findUnique({
    where: { id },
    include: {
      opportunity: {
        include: {
          organization: {
            include: {
              members: { where: { userId: session.user.id!, role: { in: ["OWNER", "ADMIN"] } } },
            },
          },
        },
      },
    },
  });

  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOrgMember = application.opportunity.organization.members.length > 0;
  const isApplicant = application.userId === session.user.id;

  if (!isOrgMember && !isApplicant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isApplicant && !isOrgMember && parsed.data.status !== "WITHDRAWN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.opportunityApplication.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ status: updated.status });
}
