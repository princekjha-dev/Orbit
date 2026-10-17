import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createAlertSchema = z.object({
  query: z.string().min(1).max(200),
  category: z.enum(["OPPORTUNITIES", "PEOPLE", "PROJECTS", "EVENTS"]),
  filters: z.record(z.string(), z.any()).optional(),
  frequency: z.enum(["INSTANT", "DAILY", "WEEKLY"]).default("DAILY"),
});

// GET /api/search/alerts - List active alerts for current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.searchAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("GET /api/search/alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

// POST /api/search/alerts - Create a new search alert
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const { query, category, filters, frequency } = parsed.data;

    const alert = await prisma.searchAlert.create({
      data: {
        userId: user.id,
        query,
        category,
        filters: (filters || {}) as any,
        frequency,
        isActive: true,
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error("POST /api/search/alerts error:", error);
    return NextResponse.json({ error: "Failed to create search alert" }, { status: 500 });
  }
}
