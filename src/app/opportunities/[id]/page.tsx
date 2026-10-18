import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { ApplyOpportunityDialog } from "@/components/opportunities/apply-opportunity-dialog";
import { SaveOpportunityButton } from "@/components/opportunities/save-opportunity-button";
import {
  MapPin,
  Clock,
  Briefcase,
  ShieldCheck,
  Building2,
  ExternalLink,
  CheckCircle2,
  Share2,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DOT_AVATARS } from "@/lib/avatars";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const opp = await prisma.opportunity.findUnique({
      where: { id },
      select: { title: true, description: true },
    });
    if (!opp) return { title: "Opportunity Details" };
    return {
      title: `${opp.title} | Orbit`,
      description: opp.description.slice(0, 160),
    };
  } catch {
    return { title: "Opportunity Details" };
  }
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  let opportunity: any = null;
  let existingApp: any = null;
  let isSaved: boolean = false;

  try {
    const [oppData, appData, savedData] = await Promise.all([
      prisma.opportunity.findUnique({
        where: { id, isDeleted: false },
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
        ? prisma.opportunityApplication.findFirst({
            where: { opportunityId: id, userId: user.id },
            select: { id: true, status: true, appliedAt: true },
          })
        : null,
      user
        ? prisma.savedOpportunity
            .findUnique({
              where: {
                opportunityId_userId: { opportunityId: id, userId: user.id },
              },
            })
            .then((s) => !!s)
        : false,
    ]);
    opportunity = oppData;
    existingApp = appData;
    isSaved = savedData;
  } catch {
    // Database offline
  }

  // Check in-memory store for newly created opportunities if DB is offline
  if (!opportunity) {
    const { inMemoryStore } = await import("@/lib/database/in-memory-store");
    if ((inMemoryStore as any).opportunities?.has(id)) {
      opportunity = (inMemoryStore as any).opportunities.get(id);
    }
  }

  if (!opportunity) {
    notFound();
  }

  const isVerifiedOrg = opportunity.organization?.verificationStatus === "VERIFIED";

  return (
    <div className="atmos-opportunities min-h-screen">
      <OrbitHeader
        title={opportunity.title}
        showBack={true}
        backHref="/opportunities"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1200px] mx-auto w-full">
        {/* Main 2-column layout: Left details, Right sticky application panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Full Editorial Spec */}
          <div className="lg:col-span-8 space-y-8">
            {/* Identity Card */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
                  {opportunity.type?.replace("_", " ")}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
                  {opportunity.workMode || "REMOTE"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#1D1D1F] leading-[1.15]">
                {opportunity.title}
              </h1>

              {/* Organization and Location Row */}
              <div className="flex flex-wrap items-center gap-4 text-[13.5px] text-[#6E6E73] pt-1">
                {opportunity.organization?.slug ? (
                  <Link
                    href={`/org/${opportunity.organization.slug}`}
                    className="flex items-center gap-1.5 font-medium text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-[#86868B]" />
                    <span>{opportunity.organization.name}</span>
                    {isVerifiedOrg && (
                      <span title="Verified by AVIS">
                        <ShieldCheck className="h-4 w-4 text-[#0071E3]" />
                      </span>
                    )}
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
                    <Building2 className="h-4 w-4 text-[#86868B]" />
                    <span>{opportunity.organization?.name || "Organization"}</span>
                  </span>
                )}

                {opportunity.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#86868B]" />
                    <span>{opportunity.location}</span>
                  </span>
                )}

                {opportunity.stipend && (
                  <span className="font-semibold text-[#1D1D1F]">
                    {opportunity.stipend}
                  </span>
                )}
              </div>

              {/* Required Skills */}
              {opportunity.skills && opportunity.skills.length > 0 && (
                <div className="pt-3 border-t border-[#F0F0F2] flex flex-wrap gap-1.5">
                  {opportunity.skills.map((s: any) => (
                    <span
                      key={s.skill?.name || s.name || s}
                      className="text-[11.5px] px-2.5 py-1 rounded-md bg-[#F5F5F7] text-[#48484A] border border-[#E5E5EA]"
                    >
                      {s.skill?.name || s.name || s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* About / Description */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
                About the Position
              </h2>
              <div className="text-[14.5px] text-[#48484A] leading-relaxed whitespace-pre-line space-y-3">
                {opportunity.description}
              </div>
            </div>

            {/* Deliverables & Evidence Expectations */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
                Proof-of-Work Standard
              </h2>
              <p className="text-[14px] text-[#6E6E73] leading-relaxed">
                Accepted candidates complete scoped project deliverables within the Orbit workspace. Each approved deliverable issues an immutable SHA-256 work record to your permanent profile evidence passport.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-1">
                  <span className="text-xs font-semibold text-[#1D1D1F]">
                    Grounded Review
                  </span>
                  <p className="text-[11.5px] text-[#6E6E73]">
                    Reviewed by engineering leadership with exact code substring quotes.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-1">
                  <span className="text-xs font-semibold text-[#1D1D1F]">
                    Verifiable Credential
                  </span>
                  <p className="text-[11.5px] text-[#6E6E73]">
                    Exportable credential passport readable by any recruiter or company.
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Identity Panel */}
            {opportunity.organization && (
              <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#1D1D1F]">
                    About {opportunity.organization.name}
                  </h3>
                  {opportunity.organization.website && (
                    <a
                      href={opportunity.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0071E3] hover:underline flex items-center gap-1"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-[13.5px] text-[#6E6E73] leading-relaxed">
                  {opportunity.organization.description || "Verified organization in good standing on Orbit."}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Application Card */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 shadow-card space-y-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Apply for Role
                </span>
                {(opportunity.compensation || opportunity.stipend) && (
                  <p className="text-xl font-bold text-[#1D1D1F] mt-1">
                    {opportunity.compensation || opportunity.stipend}
                  </p>
                )}
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  Verified scoped position • {opportunity.workMode || "Remote"}
                </p>
                {opportunity.deadline && (
                  <p className="text-[11.5px] text-[#FF9500] font-medium mt-1">
                    Deadline: {formatDate(opportunity.deadline)}
                  </p>
                )}
              </div>

              {existingApp ? (
                <div className="rounded-xl border border-[#C1EAD0] bg-[#E8F8EE] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D7F3E]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Application Submitted</span>
                  </div>
                  <p className="text-[11.5px] text-[#1D7F3E]">
                    Status: <span className="font-semibold uppercase">{existingApp.status}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ApplyOpportunityDialog
                    opportunityId={opportunity.id}
                    opportunityTitle={opportunity.title}
                    organizationName={opportunity.organization?.name}
                  />
                  <SaveOpportunityButton
                    opportunityId={opportunity.id}
                    isSaved={isSaved}
                    userId={user?.id || ""}
                  />
                </div>
              )}

              <div className="pt-3 border-t border-[#F0F0F2] text-[11.5px] text-[#86868B] space-y-2">
                <div className="flex items-center justify-between">
                  <span>Applicants</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {opportunity._count?.applications || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={DOT_AVATARS.Avis} alt="Avis" className="h-3.5 w-3.5 rounded-full object-cover" />
                    <span>AVIS Trust Engine</span>
                  </span>
                  <span className="font-medium text-[#34C759]">Guarded</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={DOT_AVATARS.Scout} alt="Scout" className="h-3.5 w-3.5 rounded-full object-cover" />
                    <span>Scout Fit Score</span>
                  </span>
                  <Link href={`/dots/scout`} className="text-[#0071E3] hover:underline">
                    Calculate fit →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
