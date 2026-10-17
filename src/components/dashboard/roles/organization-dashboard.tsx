import { prisma } from "@/lib/db";
import { getOrganizationMockData } from "@/lib/dashboard/mock-data";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  FolderKanban,
  Users,
  ShieldCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  Settings,
  FileCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export async function OrganizationDashboard({ userId }: { userId: string }) {
  let memberships: any[] = [];
  let isDemoOffline = false;

  try {
    const results = await Promise.race([
      prisma.organizationMember.findMany({
        where: { userId },
        include: {
          organization: {
            include: {
              verification: true,
              members: {
                include: { user: { select: { id: true, name: true, email: true, role: true } } },
              },
              opportunities: {
                where: { isDeleted: false },
                include: { _count: { select: { applications: true } } },
                orderBy: { createdAt: "desc" },
                take: 4,
              },
              projects: {
                where: { isDeleted: false },
                include: { _count: { select: { applications: true } } },
                take: 4,
              },
              talentPools: {
                include: { _count: { select: { candidates: true } } },
              },
            },
          },
        },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("DB offline")), 1500)
      ),
    ]);

    if (results && results.length > 0) {
      memberships = results;
    } else {
      isDemoOffline = true;
      const mock = getOrganizationMockData();
      memberships = mock.memberships;
    }
  } catch {
    isDemoOffline = true;
    const mock = getOrganizationMockData();
    memberships = mock.memberships;
  }

  const org = memberships[0]?.organization || null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" className="text-[11px] font-semibold">
              Organization Admin
            </Badge>
            {isDemoOffline && (
              <Badge variant="amber" className="text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200">
                Offline Demo Mode
              </Badge>
            )}
            <span className="text-xs text-neutral-400">Company Administration & Scoped Hiring</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {org ? org.name : "Organization Hub"}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage company verification, team access permissions, active scoped opportunities, and engineering challenges.
          </p>
        </div>

        {org && (
          <div className="flex items-center gap-2">
            <Link href={`/org/${org.slug}/opportunities/new`}>
              <Button size="sm" variant="primary" className="text-xs gap-1.5">
                <Plus className="h-4 w-4" />
                Create Opportunity
              </Button>
            </Link>
            <Link href="/analytics">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        )}
      </div>

      {!org ? (
        <Card className="p-8 text-center bg-white border border-neutral-200">
          <Building2 className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
          <h2 className="text-sm font-semibold text-neutral-900">No Organization Linked</h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto mb-4">
            Create or join an organization to post hiring opportunities, build team workspaces, and issue credentials.
          </p>
        </Card>
      ) : (
        <>
          {/* Organization Status Card */}
          <Card className="p-5 bg-white border border-neutral-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-neutral-900">{org.name}</h2>
                  <Badge
                    variant={org.verificationStatus === "VERIFIED" ? "green" : "neutral"}
                    className="text-[11px]"
                  >
                    {org.verificationStatus === "VERIFIED" ? "Verified Entity" : org.verificationStatus}
                  </Badge>
                  <span className="text-xs text-neutral-400 font-mono">org/{org.slug}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                  {org.description || "Enterprise technology and engineering organization."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/org/${org.slug}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Manage Profile
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Scoped Metric Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Team Members",
                value: org.members.length,
                icon: Users,
              },
              {
                label: "Active Opportunities",
                value: org.opportunities.length,
                icon: Briefcase,
              },
              {
                label: "Scoped Projects",
                value: org.projects.length,
                icon: FolderKanban,
              },
              {
                label: "Talent Pools",
                value: org.talentPools.length,
                icon: FileCheck,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-4 bg-white border border-neutral-200 shadow-xs">
                  <Icon className="h-4 w-4 text-neutral-400 mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
                </Card>
              );
            })}
          </div>

          {/* 2-Column: Opportunities & Team Members */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opportunities */}
            <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-neutral-500" />
                  Organization Roles & Hiring
                </h3>
                <Link href={`/org/${org.slug}/opportunities/new`} className="text-xs text-brand-600 font-medium hover:underline">
                  + Create
                </Link>
              </div>

              {org.opportunities.length === 0 ? (
                <EmptyState
                  title="No active opportunities"
                  description="Post a role or internship scoped to this organization."
                  className="py-8"
                />
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {org.opportunities.map((opp: any) => (
                    <li key={opp.id} className="p-4 flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900">{opp.title}</p>
                        <p className="text-neutral-500 text-[11px] mt-0.5">{opp.type.replace("_", " ")}</p>
                      </div>
                      <Badge variant="neutral" className="text-[10px]">
                        {opp._count.applications} applicants
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Team Members */}
            <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-neutral-500" />
                  Authorized Team Members
                </h3>
                <span className="text-xs text-neutral-400">{org.members.length} members</span>
              </div>

              <ul className="divide-y divide-neutral-100">
                {org.members.map((m: any) => (
                  <li key={m.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-neutral-900">{m.user.name}</p>
                      <p className="text-neutral-400 text-[11px] font-mono">{m.user.email}</p>
                    </div>
                    <Badge variant={m.role === "OWNER" ? "blue" : "neutral"} className="text-[10px]">
                      {m.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
