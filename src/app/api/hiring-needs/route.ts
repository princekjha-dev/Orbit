import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/hiring-needs - public discovery of open startup hiring needs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const skill = searchParams.get("skill")?.toLowerCase() || "";
    const workMode = searchParams.get("workMode") || "";

    const needs = await prisma.startupHiringNeed.findMany({
      where: {
        isOpen: true,
        ...(workMode ? { workMode: workMode as any } : {}),
      },
      include: {
        startup: {
          select: {
            id: true,
            slug: true,
            name: true,
            logo: true,
            stage: true,
            industry: true,
            creator: {
              select: { id: true, name: true, username: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const filtered = skill
      ? needs.filter((n) => n.requiredSkills.toLowerCase().includes(skill))
      : needs;

    return NextResponse.json({ hiringNeeds: filtered, total: filtered.length });
  } catch (error) {
    console.error("Error fetching hiring needs:", error);
    return NextResponse.json(
      { error: "Failed to fetch hiring needs" },
      { status: 500 }
    );
  }
}
