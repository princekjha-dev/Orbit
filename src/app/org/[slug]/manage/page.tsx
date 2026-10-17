import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Settings,
  Briefcase,
  FolderKanban,
  ShieldCheck,
  Users,
  FileCode,
  Globe,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, VerificationBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Organization" };

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
      opportunities: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { _count: { select: { applications: true } } },
      },
      projects: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { _count: { select: { applications: true } } },
      },
      verification: true,
      credentials: {
        orderBy: { createdAt: "desc" },
      },
      talentPools: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { candidates: true } },
        },
      },
      opportunityTemplates: {
        orderBy: { createdAt: "desc" },
      },
      projectTemplates: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!org) notFound();

  const latestVerification = org.verification;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Link
              href={`/org/${org.slug}`}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-900">{org.name}</h1>
                {org.verificationStatus === "VERIFIED" && (
                  <Badge variant="blue">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Verified Organization
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage organization credentials, opportunities, scoped projects, talent pools, and reusable templates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!latestVerification && (
              <Link href={`/org/${org.slug}/verify`}>
                <Button size="sm" variant="outline">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Apply for verification
                </Button>
              </Link>
            )}
            {latestVerification?.status === "PENDING" && (
              <Badge variant="amber">Verification pending review</Badge>
            )}
          </div>
        </div>

        {/* Verified Credentials Section */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Verified Organization Credentials
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Evidence submitted to verify organization authenticity and domain ownership.
              </p>
            </div>
          </div>

          {org.credentials.length === 0 ? (
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 text-xs text-neutral-600 flex items-center justify-between">
              <span>No organization credentials verified yet. Submit official domain or business registry documents.</span>
              <Link href={`/org/${org.slug}/verify`}>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Submit Credentials
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {org.credentials.map((cred) => (
                <div key={cred.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">{cred.type.replace(/_/g, " ")}</span>
                    <Badge variant={cred.isVerified ? "green" : "amber"}>
                      {cred.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-neutral-500 mt-1 truncate font-mono text-[11px]">{cred.identifier}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunities and Projects Grid */}
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
                  <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                  Post Opportunity
                </Button>
              </Link>
            </div>

            {org.opportunities.length === 0 ? (
              <EmptyState title="No opportunities posted" description="Post your first opportunity listing" />
            ) : (
              <div className="space-y-2">
                {org.opportunities.map((opp) => (
                  <Card key={opp.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="text-sm font-medium text-neutral-900 hover:text-brand-700 transition-colors"
                        >
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
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Applications
                          </Button>
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
                  <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                  Post Project
                </Button>
              </Link>
            </div>

            {org.projects.length === 0 ? (
              <EmptyState title="No projects posted" description="Post your first scoped project workspace" />
            ) : (
              <div className="space-y-2">
                {org.projects.map((proj) => (
                  <Card key={proj.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="text-sm font-medium text-neutral-900 hover:text-brand-700 transition-colors"
                        >
                          {proj.title}
                        </Link>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {proj._count.applications} applicant{proj._count.applications !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Badge
                        variant={proj.status === "OPEN" ? "green" : proj.status === "IN_PROGRESS" ? "blue" : "neutral"}
                      >
                        {proj.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* V4 Scale: Talent Pools & Reusable Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
          {/* Private Talent Pools */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-neutral-400" />
                  Private Talent Pools ({org.talentPools.length})
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Confidential talent pools accessible strictly to organization administrators.
                </p>
              </div>
            </div>

            {org.talentPools.length === 0 ? (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-500">
                No private talent pools created yet. Discover candidates from the Recruiter Workspace to curate pools.
              </div>
            ) : (
              <div className="space-y-2">
                {org.talentPools.map((pool) => (
                  <Card key={pool.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">{pool.name}</h3>
                        {pool.description && (
                          <p className="text-xs text-neutral-500 mt-0.5">{pool.description}</p>
                        )}
                        <span className="text-[11px] text-neutral-400 mt-1 block">
                          {pool._count.candidates} candidate{pool._count.candidates === 1 ? "" : "s"} shortlisted
                        </span>
                      </div>
                      <Badge variant="neutral">Private</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reusable Opportunity & Project Templates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-neutral-400" />
                  Creation Templates ({org.opportunityTemplates.length + org.projectTemplates.length})
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Standardized structures to accelerate verified listings without sacrificing quality.
                </p>
              </div>
            </div>

            {org.opportunityTemplates.length === 0 && org.projectTemplates.length === 0 ? (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-500">
                No listing templates created yet. Standardize role requirements and deliverable criteria across your team.
              </div>
            ) : (
              <div className="space-y-2">
                {org.opportunityTemplates.map((tmpl) => (
                  <Card key={tmpl.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">{tmpl.name}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">{tmpl.titleTemplate}</p>
                      </div>
                      <Badge variant="blue">Opportunity</Badge>
                    </div>
                  </Card>
                ))}
                {org.projectTemplates.map((tmpl) => (
                  <Card key={tmpl.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">{tmpl.name}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">{tmpl.deliverableTemplate}</p>
                      </div>
                      <Badge variant="amber">Project</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
