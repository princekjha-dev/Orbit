import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json({ success: true, users: [] });

  const users = await safeDbCall(
    () =>
      prisma.user.findMany({
        where: {
          AND: [
            { id: { not: user.id! } },
            { isSuspended: false },
            {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { username: { contains: q, mode: "insensitive" } },
              ],
            },
          ],
        },
        select: { id: true, name: true, username: true, image: true },
        take: 10,
      }),
    []
  );

  return NextResponse.json({ success: true, users: users || [] });
}
