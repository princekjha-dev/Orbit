import { prisma } from "@/lib/db";
import { getRecruiterMockData } from "@/lib/dashboard/mock-data";
import Link from "next/link";
import {
  Search,
  Briefcase,
  Users,
  ShieldCheck,
  Building2,
  FolderKanban,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export async function RecruiterDashboard({ userId }: { userId: string }) {
  let orgMemberships: any[] = [];
  let applications: any[] = [];
  let verifiedProofs: any[] = [];
  let isDemoOffline = false;

  try {
    const results = await Promise.race([
      prisma.organizationMember.findMany({
        where: { userId },
        include: {
          organization: {
            include: {
              opportunities: {
                where: { isActive: true, isDeleted: false },
                include: { _count: { select: { applications: true } } },
              },
              talentPools: {
                include: { _count: { select: { candidates: true } } },
              },
              candidateShortlists: {
                include: {
                  candidates: {
                    include: {
                      notes: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("DB offline")), 1500)
      ),
    ]);

    const isDemoAccount = userId.startsWith("demo-") || userId.includes("demo");

    if (results && results.length > 0) {
      orgMemberships = results;
      const org = orgMemberships[0]?.organization;
      const orgId = org?.id;

      if (orgId) {
        const [apps, proofs] = await Promise.all([
          prisma.opportunityApplication.findMany({
            where: { opportunity: { organizationId: orgId } },
            include: {
              opportunity: { select: { id: true, title: true } },
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  profile: { select: { headline: true, location: true } },
                  verifiedWorkRecords: { take: 2 },
                },
              },
            },
            orderBy: { appliedAt: "desc" },
            take: 6,
          }),
          prisma.verifiedWorkRecord.findMany({
            where: { organizationId: orgId },
            include: {
              user: { select: { name: true, username: true } },
            },
            orderBy: { completionDate: "desc" },
            take: 4,
          }),
        ]);
        applications = apps;
        verifiedProofs = proofs;
      }
    } else if (isDemoAccount) {
      isDemoOffline = true;
      const mock = getRecruiterMockData();
      orgMemberships = mock.orgMemberships;
      applications = mock.applications;
      verifiedProofs = mock.verifiedProofs;
    }
  } catch {
    const isDemoAccount = userId.startsWith("demo-") || userId.includes("demo");
    if (isDemoAccount) {
      isDemoOffline = true;
      const mock = getRecruiterMockData();
      orgMemberships = mock.orgMemberships;
      applications = mock.applications;
      verifiedProofs = mock.verifiedProofs;
    }
  }

  const org = orgMemberships[0]?.organization || null;
  const totalCandidates = applications.length;
  const totalPools = org?.talentPools?.length || 0;
  const totalOpenRoles = org?.opportunities?.length || 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" className="text-[11px] font-semibold">
              Recruiter Persona
            </Badge>
            {isDemoOffline && (
              <Badge variant="amber" className="text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200">
                Offline Demo Mode
              </Badge>
            )}
            <span className="text-xs text-neutral-400">
              {org ? `${org.name} · Evidence-Backed Sourcing` : "Talent Discovery"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Recruiter Workspace & Candidate Pipeline
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Evaluate applicants based on verified proof of work, manage scoped talent pools, and accelerate technical hiring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/recruiter">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Search className="h-4 w-4" />
              Search Talent
            </Button>
          </Link>
          <Link href="/recruiter/workspace">
            <Button size="sm" variant="primary" className="text-xs gap-1.5">
              <Users className="h-4 w-4" />
              Review Applications
            </Button>
          </Link>
        </div>
      </div>

      {/* Recruiter Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Open Opportunities",
            value: totalOpenRoles,
            href: "/opportunities",
            icon: Briefcase,
          },
          {
            label: "Applicants in Pipeline",
            value: totalCandidates,
            href: "/recruiter/workspace",
            icon: Users,
          },
          {
            label: "Active Talent Pools",
            value: totalPools,
            href: "/recruiter/workspace?tab=pools",
            icon: FolderKanban,
          },
          {
            label: "Verified Work Records",
            value: verifiedProofs.length,
            href: "/evidence/timeline",
            icon: ShieldCheck,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card hover className="p-4 bg-white border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-neutral-400" />
                  <span className="text-xs text-brand-600 font-medium">Manage &rarr;</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Talent Pools Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-neutral-500" />
            Curated Talent Pools ({totalPools})
          </h2>
          <Link href="/recruiter/workspace?tab=pools" className="text-xs text-brand-600 font-medium hover:underline">
            View all pools &rarr;
          </Link>
        </div>

        {!org || org.talentPools.length === 0 ? (
          <Card className="p-6 text-center bg-white border border-neutral-200">
            <p className="text-xs text-neutral-500">No active talent pools created.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {org.talentPools.map((pool: any) => (
              <Card key={pool.id} className="p-4 bg-white border border-neutral-200 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-neutral-900 text-sm">{pool.name}</h3>
                  <Badge variant="neutral" className="text-[10px]">
                    {pool._count.candidates} candidate{pool._count.candidates !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {pool.description || "Scoped candidate collection"}
                </p>
                {pool.tags && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-neutral-100">
                    {pool.tags.split(",").map((tag: any) => (
                      <span key={tag} className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column: Candidate Applications Pipeline & Evidence Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Pipeline */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-neutral-500" />
              Recent Candidate Inflow
            </h3>
            <Link href="/recruiter/workspace" className="text-xs text-brand-600 font-medium hover:underline">
              Pipeline &rarr;
            </Link>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              title="No applicants yet"
              description="Candidates who apply will appear here with evidence verification."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {applications.map((app) => (
                <li key={app.id} className="p-4 flex items-start justify-between gap-3 text-xs hover:bg-neutral-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm">{app.user.name}</p>
                    <p className="text-neutral-500 text-xs mt-0.5">
                      Applied for <span className="font-medium text-neutral-800">{app.opportunity.title}</span>
                    </p>
                    {app.user.verifiedWorkRecords && app.user.verifiedWorkRecords.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verified project: {app.user.verifiedWorkRecords[0].projectTitle}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="blue" className="text-[10px] shrink-0">
                    {app.status.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Verified Work Records Issued By Organization */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified Candidate Deliverables
            </h3>
            <span className="text-xs text-neutral-400">Proof of Work</span>
          </div>

          {verifiedProofs.length === 0 ? (
            <EmptyState
              title="No verified records yet"
              description="Verify completed deliverables to issue cryptographic proof of work."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {verifiedProofs.map((vw) => (
                <li key={vw.id} className="p-4 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-neutral-900">{vw.projectTitle}</p>
                    <Badge variant="green" className="text-[10px]">
                      Verified Record
                    </Badge>
                  </div>
                  <p className="text-neutral-600 mt-1">
                    Completed by <span className="font-medium text-neutral-900">{vw.user.name}</span> as {vw.userRole}
                  </p>
                  {vw.reviewText && (
                    <p className="text-neutral-500 italic mt-1 text-[11px] bg-neutral-50 p-2 rounded border border-neutral-100">
                      "{vw.reviewText}"
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
