import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/evidence/records/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await prisma.outcomeRecord.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (!record.isPublic) {
      const user = await getCurrentUser();
      if (!user || (user.id !== record.userId && (user as any).role !== "ADMIN")) {
        return NextResponse.json({ error: "This evidence is private" }, { status: 403 });
      }
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error fetching record:", error);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}

// PATCH /api/evidence/records/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const record = await prisma.outcomeRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (record.userId !== user.id && (user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.outcomeRecord.update({
      where: { id },
      data: {
        ...(typeof body.isPublic === "boolean" ? { isPublic: body.isPublic } : {}),
        ...(body.reviewText !== undefined ? { reviewText: body.reviewText } : {}),
        ...(body.evidenceUrl !== undefined ? { evidenceUrl: body.evidenceUrl } : {}),
        ...(body.deliverableUrl !== undefined ? { deliverableUrl: body.deliverableUrl } : {}),
      },
    });

    return NextResponse.json({ record: updated });
  } catch (error) {
    console.error("Error updating outcome record:", error);
    return NextResponse.json(
      { error: "Failed to update outcome record" },
      { status: 500 }
    );
  }
}

// DELETE /api/evidence/records/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const record = await prisma.outcomeRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (record.userId !== user.id && (user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.outcomeRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting outcome record:", error);
    return NextResponse.json(
      { error: "Failed to delete outcome record" },
      { status: 500 }
    );
  }
}
