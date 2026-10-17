import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { IdentityStatus } from "@prisma/client";

// GET /api/identity/verification - get current user's identity verification state
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = await prisma.identityVerification.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        legalName: true,
        documentType: true,
        documentNumberMasked: true,
        rejectionReason: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ verification });
  } catch (error) {
    console.error("Error fetching identity verification:", error);
    return NextResponse.json(
      { error: "Failed to fetch identity verification" },
      { status: 500 }
    );
  }
}

// POST /api/identity/verification - submit identity verification request
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { legalName, documentType, documentNumber, verificationUrl } = body;

    if (!legalName || !documentType || !documentNumber) {
      return NextResponse.json(
        { error: "legalName, documentType, and documentNumber are required" },
        { status: 400 }
      );
    }

    // Always mask the document number before storing
    const rawNumber = String(documentNumber).trim();
    const lastFour = rawNumber.slice(-4);
    const masked = `****${lastFour || "0000"}`;

    const verification = await prisma.identityVerification.upsert({
      where: { userId: user.id },
      update: {
        legalName: legalName.trim(),
        documentType: documentType.trim(),
        documentNumberMasked: masked,
        verificationUrl: verificationUrl?.trim() || null,
        status: IdentityStatus.PENDING,
        rejectionReason: null,
      },
      create: {
        userId: user.id,
        legalName: legalName.trim(),
        documentType: documentType.trim(),
        documentNumberMasked: masked,
        verificationUrl: verificationUrl?.trim() || null,
        status: IdentityStatus.PENDING,
      },
      select: {
        id: true,
        status: true,
        legalName: true,
        documentType: true,
        documentNumberMasked: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ verification }, { status: 201 });
  } catch (error) {
    console.error("Error submitting identity verification:", error);
    return NextResponse.json(
      { error: "Failed to submit identity verification" },
      { status: 500 }
    );
  }
}
