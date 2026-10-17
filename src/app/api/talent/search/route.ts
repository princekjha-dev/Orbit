import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/talent/search - Explainable talent search based on verified evidence
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const skillsParam = searchParams.get("skills") || "";
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const location = searchParams.get("location")?.toLowerCase() || "";

    const searchSkills = skillsParam
      ? skillsParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    // Find candidates (STUDENT role or general talent)
    const candidates = await prisma.user.findMany({
      where: {
        isSuspended: false,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { profile: { headline: { contains: query, mode: "insensitive" } } },
                { profile: { about: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(location
          ? {
              profile: {
                location: { contains: location, mode: "insensitive" },
              },
            }
          : {}),
        ...(verifiedOnly
          ? {
              verifiedWorkRecords: {
                some: {},
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        profile: {
          select: {
            headline: true,
            location: true,
            github: true,
            skills: {
              select: {
                skill: { select: { name: true } },
              },
            },
            experience: {
              select: { company: true, title: true, current: true },
            },
          },
        },
        verifiedWorkRecords: {
          select: { id: true, projectTitle: true, orgName: true, userRole: true },
        },
        skillEvidences: {
          select: {
            id: true,
            skillName: true,
            evidenceType: true,
            proofType: true,
            title: true,
          },
        },
      },
      take: 40,
    });

    // Compute explainable matching reason for each candidate
    const results = candidates.map((candidate) => {
      const candidateSkills = (candidate.profile?.skills || []).map((s) =>
        s.skill.name.toLowerCase()
      );
      const matchedSkills = searchSkills.filter((s) => candidateSkills.includes(s));
      const verifiedProjectCount = candidate.verifiedWorkRecords.length;
      const externalProofCount = candidate.skillEvidences.filter(
        (e) => e.evidenceType === "EXTERNAL"
      ).length;

      // Construct transparent, explainable reason
      let matchReason = "";
      if (searchSkills.length > 0 && matchedSkills.length > 0) {
        matchReason = `Matches skills: ${matchedSkills.join(", ")}.`;
      } else if (candidate.profile?.headline) {
        matchReason = `Profile focus: ${candidate.profile.headline}.`;
      } else {
        matchReason = "Relevant background on Orbit.";
      }

      if (verifiedProjectCount > 0) {
        matchReason += ` Has ${verifiedProjectCount} verified project${
          verifiedProjectCount > 1 ? "s" : ""
        } on record.`;
      } else if (externalProofCount > 0) {
        matchReason += ` Backed by ${externalProofCount} external repository/artifact${
          externalProofCount > 1 ? "s" : ""
        }.`;
      }

      return {
        id: candidate.id,
        name: candidate.name,
        username: candidate.username,
        image: candidate.image,
        headline: candidate.profile?.headline || null,
        location: candidate.profile?.location || null,
        skills: (candidate.profile?.skills || []).map((s) => s.skill.name),
        verifiedProjectCount,
        externalProofCount,
        matchReason: matchReason.trim(),
        hasVerifiedEvidence: verifiedProjectCount > 0,
      };
    });

    // Filter by skills if provided
    const filtered = searchSkills.length > 0
      ? results.filter((r) =>
          searchSkills.some((s) =>
            r.skills.map((k) => k.toLowerCase()).includes(s)
          )
        )
      : results;

    return NextResponse.json({ candidates: filtered, total: filtered.length });
  } catch (error) {
    console.error("Error searching talent:", error);
    return NextResponse.json(
      { error: "Failed to search talent" },
      { status: 500 }
    );
  }
}
