import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Settings, Briefcase, FolderKanban, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, VerificationBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Organization" };

interface PageProps { params: Promise<{ slug: string }> }

export default async function ManageOrgPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await requireAuth();

  const org = await prisma.organization.findFirst({
    where: {
      slug,
      isDeleted: false,
      members: { some: { userId: user.id!, role: { in: ["OWNER", "ADMIN"] } } },
    },
    include: {
      opportunities: { where: { isDeleted: false }, orderBy: { createdAt: "desc" }, take: 10,
        include: { _count: { select: { applications: true } } } },
      projects: { where: { isDeleted: false }, orderBy: { createdAt: "desc" }, take: 10,
        include: { _count: { select: { applications: true } } } },
      verification: true,
    },
  });

  if (!org) notFound();

  const latestVerification = org.verification;

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={`/org/${org.slug}`} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{org.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <VerificationBadge status={org.verificationStatus} />
                {!latestVerification && (
                  <Link href={`/org/${org.slug}/verify`}>
                    <Button size="sm" variant="outline">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Apply for verification
                    </Button>
                  </Link>
                )}
                {latestVerification?.status === "PENDING" && (
                  <Badge variant="amber">Verification pending</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                Opportunities ({org.opportunities.length})
              </h2>
              <Link href={`/org/${org.slug}/opportunities/new`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Post
                </Button>
              </Link>
            </div>

            {org.opportunities.length === 0 ? (
              <EmptyState title="No opportunities posted" description="Post your first opportunity" />
            ) : (
              <div className="space-y-2">
                {org.opportunities.map((opp) => (
                  <Card key={opp.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/opportunities/${opp.id}`}
                          className="text-sm font-medium text-neutral-900 hover:text-brand-700 transition-colors">
                          {opp.title}
                        </Link>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {opp._count.applications} applicant{opp._count.applications !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={opp.isActive ? "green" : "neutral"}>
                          {opp.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Link href={`/opportunities/${opp.id}/applications`}>
                          <Button size="sm" variant="outline">Applications</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                Projects ({org.projects.length})
              </h2>
              <Link href={`/org/${org.slug}/projects/new`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Post
                </Button>
              </Link>
            </div>

            {org.projects.length === 0 ? (
              <EmptyState title="No projects posted" description="Post your first scoped project" />
            ) : (
              <div className="space-y-2">
                {org.projects.map((proj) => (
                  <Card key={proj.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/projects/${proj.id}`}
                          className="text-sm font-medium text-neutral-900 hover:text-brand-700 transition-colors">
                          {proj.title}
                        </Link>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {proj._count.applications} applicant{proj._count.applications !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Badge variant={proj.status === "OPEN" ? "green" : proj.status === "IN_PROGRESS" ? "blue" : "neutral"}>
                        {proj.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
