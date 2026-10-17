import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateAlertSchema = z.object({
  isActive: z.boolean().optional(),
  frequency: z.enum(["INSTANT", "DAILY", "WEEKLY"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const alert = await prisma.searchAlert.findUnique({
      where: { id },
    });

    if (!alert || alert.userId !== user.id) {
      return NextResponse.json({ error: "Alert not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.searchAlert.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ alert: updated });
  } catch (error) {
    console.error("PATCH /api/search/alerts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const alert = await prisma.searchAlert.findUnique({
      where: { id },
    });

    if (!alert || alert.userId !== user.id) {
      return NextResponse.json({ error: "Alert not found or unauthorized" }, { status: 404 });
    }

    await prisma.searchAlert.delete({ where: { id } });

    return NextResponse.json({ message: "Alert deleted" });
  } catch (error) {
    console.error("DELETE /api/search/alerts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
