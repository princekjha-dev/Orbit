import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const edu = await prisma.education.findFirst({
    where: { id, profile: { userId: session.user.id! } },
  });
  if (!edu) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.education.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
