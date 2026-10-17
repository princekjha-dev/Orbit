import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";

// GET /api/evidence/timeline - chronological aggregated verified timeline
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId") || user.id;

    // Fetch verified work records, completed projects, hackathon submissions, and outcome records
    const [verifiedWork, outcomeRecords, hackathonTeams, portableCredentials] = await Promise.all([
      prisma.verifiedWorkRecord.findMany({
        where: { userId: targetUserId },
        orderBy: { completionDate: "desc" },
      }),
      prisma.outcomeRecord.findMany({
        where: { userId: targetUserId, isPublic: true },
        orderBy: { date: "desc" },
      }),
      prisma.hackathonMember.findMany({
        where: { userId: targetUserId },
        include: {
          team: {
            include: {
              submissions: true,
            },
          },
        },
      }),
      prisma.portableEvidenceCredential.findMany({
        where: { userId: targetUserId, isRevoked: false },
        orderBy: { issuedAt: "desc" },
      }),
    ]);

    // Build timeline items
    const items: {
      id: string;
      title: string;
      type: "PROJECT" | "OUTCOME" | "HACKATHON" | "CREDENTIAL";
      organizationName?: string | null;
      role?: string | null;
      description?: string | null;
      date: string;
      year: number;
      evidenceUrl?: string | null;
      verified: boolean;
    }[] = [];

    for (const w of verifiedWork) {
      const d = new Date(w.completionDate);
      items.push({
        id: `work-${w.id}`,
        title: w.projectTitle,
        type: "PROJECT",
        organizationName: w.orgName,
        role: w.userRole,
        description: w.scope,
        date: d.toISOString(),
        year: d.getFullYear(),
        evidenceUrl: w.evidenceUrl || w.deliverableUrl,
        verified: true,
      });
    }

    for (const o of outcomeRecords) {
      const d = new Date(o.date);
      items.push({
        id: `outcome-${o.id}`,
        title: o.title,
        type: "OUTCOME",
        organizationName: o.organizationName,
        description: o.activity,
        date: d.toISOString(),
        year: d.getFullYear(),
        evidenceUrl: o.evidenceUrl || o.deliverableUrl,
        verified: true,
      });
    }

    for (const hm of hackathonTeams) {
      if (hm.team) {
        const sub = hm.team.submissions?.[0];
        const d = new Date(hm.joinedAt);
        items.push({
          id: `hackathon-${hm.id}`,
          title: sub ? sub.title : `Hackathon Team ${hm.team.name}`,
          type: "HACKATHON",
          organizationName: hm.team.name,
          role: hm.role,
          description: sub?.description || `Member of ${hm.team.name}`,
          date: d.toISOString(),
          year: d.getFullYear(),
          evidenceUrl: sub?.demoUrl || sub?.githubUrl || null,
          verified: true,
        });
      }
    }

    for (const c of portableCredentials) {
      const d = new Date(c.issuedAt);
      items.push({
        id: `cred-${c.id}`,
        title: c.title,
        type: "CREDENTIAL",
        organizationName: c.issuerName,
        role: c.role,
        description: c.summary,
        date: d.toISOString(),
        year: d.getFullYear(),
        evidenceUrl: `/verify/${c.slug}`,
        verified: true,
      });
    }

    // Sort chronologically descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Group by year
    const byYear: Record<number, typeof items> = {};
    for (const item of items) {
      if (!byYear[item.year]) byYear[item.year] = [];
      byYear[item.year].push(item);
    }

    return NextResponse.json({
      timeline: items,
      byYear,
      totalCount: items.length,
    });
  } catch (error) {
    console.error("Error fetching evidence timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch evidence timeline" },
      { status: 500 }
    );
  }
}
