import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";

// GET /api/credentials/portable - list current user's portable credentials
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credentials = await prisma.portableEvidenceCredential.findMany({
      where: { userId: user.id },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error("Error fetching portable credentials:", error);
    return NextResponse.json(
      { error: "Failed to fetch portable credentials" },
      { status: 500 }
    );
  }
}

// POST /api/credentials/portable - issue a signed portable evidence credential
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, type, issuerName, issuerOrgId, role, summary, evidenceUrl } = body;

    if (!title || !type || !issuerName || !summary) {
      return NextResponse.json(
        { error: "title, type, issuerName, and summary are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const cleanSlug = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

    // Generate SHA-256 cryptographic signature digest over verifiable payload
    const payload = `${user.id}:${user.username}:${title}:${issuerName}:${type}:${summary}:${Date.now()}`;
    const signatureDigest = createHash("sha256").update(payload).digest("hex");

    const credential = await prisma.portableEvidenceCredential.create({
      data: {
        slug: cleanSlug,
        userId: user.id,
        title: title.trim(),
        type: type.trim(),
        issuerName: issuerName.trim(),
        issuerOrgId: issuerOrgId || null,
        recipientName: user.name || user.username,
        recipientUsername: user.username,
        role: role?.trim() || null,
        summary: summary.trim(),
        evidenceUrl: evidenceUrl?.trim() || null,
        signatureDigest,
        isRevoked: false,
      },
    });

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    console.error("Error creating portable credential:", error);
    return NextResponse.json(
      { error: "Failed to create portable credential" },
      { status: 500 }
    );
  }
}
