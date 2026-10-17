import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exp = await prisma.experience.findFirst({
    where: { id, profile: { userId: session.user.id! } },
  });
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.experience.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
