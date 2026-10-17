import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Calendar,
  ExternalLink,
  CheckCircle,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, OpportunityTypeBadge, VerificationBadge, WorkModeBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ApplyOpportunityDialog } from "@/components/opportunities/apply-opportunity-dialog";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const opp = await prisma.opportunity.findUnique({
    where: { id: params.id },
    select: { title: true, description: true },
  });
  if (!opp) return { title: "Opportunity not found" };
  return {
    title: opp.title,
    description: opp.description.slice(0, 160),
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  const [opportunity, existingApp, isSaved] = await Promise.all([
    prisma.opportunity.findUnique({
      where: { id: params.id, isDeleted: false },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            website: true,
            description: true,
            industry: true,
            verificationStatus: true,
          },
        },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    }),
    user
      ? prisma.opportunityApplication.findUnique({
          where: {
            opportunityId_userId: {
              opportunityId: params.id,
              userId: user.id!,
            },
          },
        })
      : null,
    user
      ? prisma.savedOpportunity.findUnique({
          where: {
            opportunityId_userId: {
              opportunityId: params.id,
              userId: user.id!,
            },
          },
        })
      : null,
  ]);

  if (!opportunity) notFound();

  const isExpired =
    opportunity.deadline && new Date(opportunity.deadline) < new Date();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to opportunities
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                {opportunity.organization.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={opportunity.organization.logoUrl}
                    alt={opportunity.organization.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-neutral-500">
                    {opportunity.organization.name[0]}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h1 className="text-xl font-bold text-neutral-900">
                      {opportunity.title}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Link
                        href={`/org/${opportunity.organization.slug}`}
                        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
                      >
                        {opportunity.organization.name}
                      </Link>
                      {opportunity.organization.verificationStatus === "VERIFIED" && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-green-700">
                          <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <OpportunityTypeBadge type={opportunity.type} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-neutral-100">
              {opportunity.location && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <MapPin className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  {opportunity.location}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                <WorkModeBadge mode={opportunity.workMode} />
              </div>
              {opportunity.compensation && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  {opportunity.compensation}
                </div>
              )}
              {opportunity.duration && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <Clock className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  {opportunity.duration}
                </div>
              )}
              {opportunity.deadline && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <Calendar className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  Deadline: {formatDate(opportunity.deadline)}
                  {isExpired && (
                    <Badge variant="red">Closed</Badge>
                  )}
                </div>
              )}
            </div>

            {opportunity.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Required skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.skills.map((s) => (
                    <Badge key={s.skillId} variant="neutral">
                      {s.skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Description */}
          <Card>
            <h2 className="text-base font-semibold text-neutral-900 mb-4">
              About this opportunity
            </h2>
            <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {opportunity.description}
            </div>
          </Card>

          {opportunity.eligibility && (
            <Card>
              <h2 className="text-base font-semibold text-neutral-900 mb-3">
                Eligibility
              </h2>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {opportunity.eligibility}
              </p>
            </Card>
          )}

          {opportunity.applicationReqs && (
            <Card>
              <h2 className="text-base font-semibold text-neutral-900 mb-3">
                What to include in your application
              </h2>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {opportunity.applicationReqs}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply card */}
          <Card>
            {existingApp ? (
              <div>
                <p className="text-sm font-medium text-neutral-900 mb-1">
                  You applied for this role
                </p>
                <p className="text-xs text-neutral-500 mb-3">
                  Applied {formatDate(existingApp.appliedAt)}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">Status:</span>
                  <Badge variant={existingApp.status === "SELECTED" ? "green" : existingApp.status === "REJECTED" ? "red" : "blue"}>
                    {existingApp.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ) : isExpired ? (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-1">
                  Applications closed
                </p>
                <p className="text-xs text-neutral-500">
                  The deadline for this opportunity has passed.
                </p>
              </div>
            ) : !user ? (
              <div>
                <p className="text-sm text-neutral-700 mb-3">
                  Sign in to apply for this opportunity.
                </p>
                <Link href="/login">
                  <Button className="w-full">Sign in to apply</Button>
                </Link>
              </div>
            ) : (
              <ApplyOpportunityDialog opportunityId={opportunity.id} />
            )}
          </Card>

          {/* Organization */}
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {opportunity.organization.name}
                </p>
                <VerificationBadge status={opportunity.organization.verificationStatus} />
              </div>
            </div>
            {opportunity.organization.description && (
              <p className="text-xs text-neutral-500 mb-3 line-clamp-3">
                {opportunity.organization.description}
              </p>
            )}
            {opportunity.organization.industry && (
              <p className="text-xs text-neutral-500 mb-3">
                Industry: {opportunity.organization.industry}
              </p>
            )}
            <Link href={`/org/${opportunity.organization.slug}`}>
              <Button variant="outline" size="sm" className="w-full">
                View organization
              </Button>
            </Link>
            {opportunity.organization.website && (
              <a
                href={opportunity.organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                Visit website
              </a>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
