import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getEvidencePassport } from "@/lib/passport/passport-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "candidate-alex-chen";

    const passport = await getEvidencePassport(userId);

    // Export in standard W3C Verifiable Credential / JSON-LD format
    const jsonLdExport = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://orbit.dev/credentials/passport/v1",
      ],
      id: `urn:uuid:${passport.userId}`,
      type: ["VerifiableCredential", "OrbitEvidencePassport"],
      issuer: "https://orbit.dev/issuer/orbitmod-v5",
      issuanceDate: passport.generatedAt,
      credentialSubject: {
        id: `did:orbit:${passport.username}`,
        displayName: passport.displayName,
        headline: passport.headline,
        avisVerification: passport.avisVerification,
        skills: passport.verifiedSkills,
        evidenceArtifactsCount: passport.evidenceArtifacts.length,
        completedProjectsCount: passport.completedProjects.length,
      },
      proof: {
        type: "Sha256Signature2026",
        created: passport.generatedAt,
        digestHex: passport.portableDigest,
        verificationMethod: "https://orbit.dev/keys/orbitmod-root.pub",
      },
    };

    return NextResponse.json(jsonLdExport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to export credential" }, { status: 500 });
  }
}
