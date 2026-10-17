import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

const saveSearchSchema = z.object({
  category: z.string().default("ALL"),
  query: z.string().min(1).max(200),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ searches: saved });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = saveSearchSchema.parse(body);

    const saved = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        category: parsed.category,
        query: parsed.query,
      },
    });

    return NextResponse.json({ saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save search" }, { status: 500 });
  }
}
