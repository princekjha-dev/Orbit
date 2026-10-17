import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock,
  Wifi,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ApplicationStatusBadge,
  Badge,
  OpportunityTypeBadge,
  VerificationBadge,
  WorkModeBadge,
} from "@/components/ui/badge";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { OpportunityFilters } from "@/components/opportunities/opportunity-filters";
import type { Metadata } from "next";
import { SaveOpportunityButton } from "@/components/opportunities/save-opportunity-button";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Browse verified jobs, internships, and startup roles on Orbit.",
};

interface PageProps {
  searchParams: {
    q?: string;
    type?: string;
    mode?: string;
    tab?: string;
    location?: string;
  };
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const tab = searchParams.tab || "browse";

  const whereClause: any = {
    isActive: true,
    isDeleted: false,
  };

  if (searchParams.q) {
    whereClause.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { description: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.type && searchParams.type !== "all") {
    whereClause.type = searchParams.type;
  }
  if (searchParams.mode && searchParams.mode !== "all") {
    whereClause.workMode = searchParams.mode;
  }
  if (searchParams.location) {
    whereClause.location = {
      contains: searchParams.location,
      mode: "insensitive",
    };
  }

  const [opportunities, savedIds, myApplications] = await Promise.all([
    prisma.opportunity.findMany({
      where: whereClause,
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
            verificationStatus: true,
          },
        },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    user
      ? prisma.savedOpportunity.findMany({
          where: { userId: user.id! },
          select: { opportunityId: true },
        })
      : [],
    user
      ? prisma.opportunityApplication.findMany({
          where: { userId: user.id! },
          include: {
            opportunity: {
              include: {
                organization: { select: { name: true } },
                skills: { include: { skill: true } },
              },
            },
          },
          orderBy: { appliedAt: "desc" },
        })
      : [],
  ]);

  const savedSet = new Set(savedIds.map((s) => s.opportunityId));

  if (tab === "applications") {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">My applications</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Track the status of your opportunity applications.
          </p>
        </div>
        <div className="flex gap-4 mb-6 border-b border-neutral-200">
          <Link
            href="/opportunities"
            className="pb-3 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Browse
          </Link>
          <span className="pb-3 text-sm font-semibold text-brand-600 border-b-2 border-brand-600">
            My applications
          </span>
          <Link
            href="/opportunities?tab=saved"
            className="pb-3 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Saved
          </Link>
        </div>
        {myApplications.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            title="No applications yet"
            description="Apply to opportunities to track them here"
            action={
              <Link href="/opportunities">
                <Button size="sm">Browse opportunities</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {myApplications.map((app) => (
              <Link
                key={app.id}
                href={`/opportunities/${app.opportunityId}`}
                className="block"
              >
                <Card hover className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-neutral-900">
                        {app.opportunity.title}
                      </p>
                      <OpportunityTypeBadge type={app.opportunity.type} />
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {app.opportunity.organization.name}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Applied {formatRelativeDate(app.appliedAt)}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tab === "saved") {
    const savedOpps = await prisma.savedOpportunity.findMany({
      where: { userId: user?.id! },
      include: {
        opportunity: {
          include: {
            organization: { select: { name: true, slug: true, verificationStatus: true } },
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    });

    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Saved opportunities</h1>
        </div>
        <div className="flex gap-4 mb-6 border-b border-neutral-200">
          <Link href="/opportunities" className="pb-3 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Browse</Link>
          <Link href="/opportunities?tab=applications" className="pb-3 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">My applications</Link>
          <span className="pb-3 text-sm font-semibold text-brand-600 border-b-2 border-brand-600">Saved</span>
        </div>
        {savedOpps.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            title="No saved opportunities"
            description="Save opportunities you want to apply to later"
          />
        ) : (
          <div className="space-y-3">
            {savedOpps.map((s) => (
              <OpportunityCard
                key={s.id}
                opportunity={s.opportunity as any}
                isSaved={true}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Opportunities</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {opportunities.length} open listing{opportunities.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-neutral-200">
        <span className="pb-3 text-sm font-semibold text-brand-600 border-b-2 border-brand-600">Browse</span>
        {user && (
          <>
            <Link href="/opportunities?tab=applications" className="pb-3 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">My applications</Link>
            <Link href="/opportunities?tab=saved" className="pb-3 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Saved</Link>
          </>
        )}
      </div>

      <OpportunityFilters />

      {opportunities.length === 0 ? (
        <EmptyState
          icon={<Briefcase />}
          title="No opportunities found"
          description="Try adjusting your search filters"
        />
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp as any}
              isSaved={savedSet.has(opp.id)}
              userId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityCard({
  opportunity,
  isSaved,
  userId,
}: {
  opportunity: any;
  isSaved: boolean;
  userId?: string;
}) {
  return (
    <Card hover className="p-0 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
            {opportunity.organization.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={opportunity.organization.logoUrl}
                alt={opportunity.organization.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-neutral-500">
                {opportunity.organization.name[0]}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/opportunities/${opportunity.id}`}
                  className="text-sm font-semibold text-neutral-900 hover:text-brand-700 transition-colors"
                >
                  {opportunity.title}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <Link
                    href={`/org/${opportunity.organization.slug}`}
                    className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    {opportunity.organization.name}
                  </Link>
                  {opportunity.organization.verificationStatus === "VERIFIED" && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-green-700">
                      <CheckCircle className="h-3 w-3" aria-hidden="true" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <OpportunityTypeBadge type={opportunity.type} />
                {userId && (
                  <SaveOpportunityButton
                    opportunityId={opportunity.id}
                    isSaved={isSaved}
                    userId={userId}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3 flex-wrap text-xs text-neutral-500">
              {opportunity.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {opportunity.location}
                </span>
              )}
              <WorkModeBadge mode={opportunity.workMode} />
              {opportunity.compensation && (
                <span className="flex items-center gap-1">
                  {opportunity.compensation}
                </span>
              )}
              {opportunity.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Deadline {formatDate(opportunity.deadline)}
                </span>
              )}
            </div>

            {opportunity.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {opportunity.skills.slice(0, 6).map((s: any) => (
                  <Badge key={s.skillId} variant="neutral">
                    {s.skill.name}
                  </Badge>
                ))}
                {opportunity.skills.length > 6 && (
                  <Badge variant="neutral">+{opportunity.skills.length - 6} more</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
