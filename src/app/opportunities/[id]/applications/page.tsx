import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, ApplicationStatusBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ApplicationStatusSelect } from "@/components/opportunities/application-status-select";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Applications" };

interface PageProps { params: { id: string } }

export default async function OpportunityApplicationsPage({ params }: PageProps) {
  const user = await requireAuth();

  const opportunity = await prisma.opportunity.findFirst({
    where: {
      id: params.id,
      isDeleted: false,
      organization: {
        members: { some: { userId: user.id!, role: { in: ["OWNER", "ADMIN"] } } },
      },
    },
    include: {
      organization: { select: { name: true, slug: true } },
      applications: {
        include: {
          user: {
            include: {
              profile: { select: { headline: true, github: true, portfolio: true, linkedin: true } },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!opportunity) notFound();

  const byStatus = {
    APPLIED: opportunity.applications.filter((a) => a.status === "APPLIED"),
    UNDER_REVIEW: opportunity.applications.filter((a) => a.status === "UNDER_REVIEW"),
    SHORTLISTED: opportunity.applications.filter((a) => a.status === "SHORTLISTED"),
    INTERVIEW: opportunity.applications.filter((a) => a.status === "INTERVIEW"),
    SELECTED: opportunity.applications.filter((a) => a.status === "SELECTED"),
    REJECTED: opportunity.applications.filter((a) => a.status === "REJECTED"),
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/org/${opportunity.organization.slug}/manage`}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{opportunity.title}</h1>
            <p className="text-sm text-neutral-500">
              {opportunity.applications.length} application{opportunity.applications.length !== 1 ? "s" : ""}
              {" · "}{opportunity.organization.name}
            </p>
          </div>
        </div>

        {/* Pipeline summary */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {Object.entries(byStatus).map(([status, apps]) => (
            <div key={status} className="text-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <p className="text-xl font-bold text-neutral-900">{apps.length}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{status.replace("_", " ")}</p>
            </div>
          ))}
        </div>

        {/* Applications list */}
        {opportunity.applications.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-sm font-medium text-neutral-700">No applications yet</p>
            <p className="text-xs text-neutral-500 mt-1">Share the opportunity link to attract candidates.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {opportunity.applications.map((app) => (
              <Card key={app.id}>
                <div className="flex items-start gap-4 flex-wrap">
                  <Avatar src={app.user.image} name={app.user.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{app.user.name}</p>
                        {app.user.profile?.headline && (
                          <p className="text-xs text-neutral-500">{app.user.profile.headline}</p>
                        )}
                        <p className="text-xs text-neutral-400 mt-0.5">Applied {formatDate(app.appliedAt)}</p>
                      </div>
                      <ApplicationStatusSelect applicationId={app.id} currentStatus={app.status} />
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {app.user.profile?.github && (
                        <a href={app.user.profile.github} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline">GitHub</a>
                      )}
                      {app.user.profile?.linkedin && (
                        <a href={app.user.profile.linkedin} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline">LinkedIn</a>
                      )}
                      {app.user.profile?.portfolio && (
                        <a href={app.user.profile.portfolio} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline">Portfolio</a>
                      )}
                      {app.portfolioUrl && (
                        <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline">Work sample</a>
                      )}
                    </div>

                    {/* Cover letter */}
                    {app.coverLetter && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                        <p className="text-xs font-medium text-neutral-500 mb-1">Cover letter</p>
                        <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
