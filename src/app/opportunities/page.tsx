import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { FeaturePanel } from "@/components/ui/feature-panel";
import { ContentRail } from "@/components/ui/content-rail";
import { OpportunityCard } from "@/components/ui/orbit-cards";
import { OpportunitiesClientView } from "@/components/opportunities/opportunities-client-view";
import { ArrowRight, ShieldCheck, Briefcase } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Opportunities worth pursuing across verified organizations.",
};

interface PageProps {
  searchParams?: Promise<{
    q?: string;
    type?: string;
    mode?: string;
  }>;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = searchParams ? await searchParams : {};
  const query = params.q || "";
  const typeFilter = params.type || "all";

  let opportunities: any[] = [];
  try {
    const opps = await prisma.opportunity.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
            verificationStatus: true,
          },
        },
        skills: {
          include: { skill: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
    opportunities = opps || [];
  } catch {
    // Database fallback
  }

  // Check in-memory store if DB is offline
  if (opportunities.length === 0) {
    const { inMemoryStore } = await import("@/lib/database/in-memory-store");
    if (inMemoryStore?.opportunities && inMemoryStore.opportunities.size > 0) {
      opportunities = Array.from(inMemoryStore.opportunities.values()).filter(
        (o: any) => o.isActive && !o.isDeleted
      );
    }
  }

  const featured = opportunities.length > 0 ? opportunities[0] : null;
  const recommendedRail = opportunities.length > 1 ? opportunities.slice(1, 7) : [];

  return (
    <div className="atmos-opportunities min-h-screen">
      <OrbitHeader
        title="Opportunities"
        actions={
          <Link
            href="/search"
            className="text-xs text-[#0071E3] font-medium hover:underline px-2 py-1"
          >
            Saved filters
          </Link>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-10 max-w-[1240px] mx-auto w-full">
        {/* Large Editorial Intro */}
        <PageIntro
          eyebrow="Curated Work & Fellowships"
          title="Find work worth doing."
          description="Explore jobs, internships, fellowships and other opportunities from across the Orbit ecosystem."
        />

        {/* Featured Opportunity FeaturePanel */}
        {featured && (
          <FeaturePanel
            theme="blue"
            eyebrow="Featured Opportunity"
            badge="Verified Organization"
            title={featured.title}
            description={featured.description || "Join an engineering team building verifiable work standards and high-throughput systems."}
            primaryAction={{
              label: "View Opportunity & Apply",
              href: `/opportunities/${featured.id}`,
            }}
            secondaryAction={{
              label: "Explore Organization",
              href: featured.organization?.slug ? `/org/${featured.organization.slug}` : "/opportunities",
            }}
            visualContent={
              <div className="w-full max-w-sm rounded-2xl border border-[#B9DCFF] bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-[#6E6E73]">
                  <span className="text-[#1D1D1F] font-semibold">
                    {featured.organization?.name}
                  </span>
                  <span className="flex items-center gap-1 text-[#0071E3]">
                    <ShieldCheck className="h-3.5 w-3.5" /> AVIS Verified
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#6E6E73]">
                  <p>• {featured.location || "Remote"}</p>
                  <p>• {featured.type?.replace("_", " ")}</p>
                  <p>• {featured.stipend || "Competitive compensation"}</p>
                </div>
              </div>
            }
          />
        )}

        {/* Opportunity Content Rail */}
        {recommendedRail.length > 0 && (
          <ContentRail
            title="Recommended Positions"
            subtitle="Matched based on observable skill verification and team demand"
          >
            {recommendedRail.map((opp) => (
              <div key={opp.id} className="min-w-[300px] sm:min-w-[340px] snap-start">
                <OpportunityCard
                  id={opp.id}
                  title={opp.title}
                  organization={opp.organization?.name || "Verified Organization"}
                  organizationSlug={opp.organization?.slug}
                  location={opp.location || "Remote"}
                  type={opp.type}
                  workMode={opp.workMode}
                  stipend={opp.stipend}
                  skills={opp.skills?.map((s: any) => s.skill?.name || s.name) || ["Engineering"]}
                  isVerified={opp.organization?.verificationStatus === "VERIFIED"}
                />
              </div>
            ))}
          </ContentRail>
        )}

        {/* Full Interactive Opportunity List with Category Tabs */}
        <section className="space-y-4 pt-4">
          <div className="border-t border-[#E5E5EA] pt-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] mb-6">
              All Opportunities
            </h2>
            {opportunities.length > 0 ? (
              <OpportunitiesClientView initialOpportunities={opportunities} />
            ) : (
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No opportunities yet"
                description="New opportunities will appear here as organizations publish them."
                action={<Link href="/projects" className="text-sm font-medium text-[#0071E3] hover:underline">Explore Projects <ArrowRight className="inline h-4 w-4" /></Link>}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
