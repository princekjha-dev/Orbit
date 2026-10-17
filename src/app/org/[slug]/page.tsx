import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, MapPin, Briefcase, FolderKanban, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, VerificationBadge, OpportunityTypeBadge, WorkModeBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const org = await prisma.organization.findUnique({ where: { slug: params.slug }, select: { name: true, description: true } });
  return { title: org?.name ?? "Organization", description: org?.description?.slice(0, 160) };
}

export default async function OrgProfilePage({ params }: PageProps) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.slug, isDeleted: false },
    include: {
      opportunities: {
        where: { isActive: true, isDeleted: false },
        include: { skills: { include: { skill: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      projects: {
        where: { status: { in: ["OPEN"] }, isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      verification: true,
      _count: { select: { opportunities: true, projects: true } },
    },
  });

  if (!org) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-xl bg-neutral-100 flex items-center justify-center text-xl font-bold text-neutral-500 mb-3">
                {org.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={org.logoUrl} alt={org.name} className="h-16 w-16 rounded-xl object-cover" />
                ) : org.name[0]}
              </div>
              <h1 className="text-lg font-bold text-neutral-900">{org.name}</h1>
              <div className="mt-2">
                <VerificationBadge status={org.verificationStatus} />
              </div>
              {org.industry && <p className="text-xs text-neutral-500 mt-1">{org.industry}</p>}
              {org.location && (
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />{org.location}
                </p>
              )}
            </div>
            {org.website && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <a href={org.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900">
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  {org.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </Card>

          <Card>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-neutral-900">{org._count.opportunities}</p>
                <p className="text-xs text-neutral-500">Opportunities</p>
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{org._count.projects}</p>
                <p className="text-xs text-neutral-500">Projects</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {org.description && (
            <Card>
              <h2 className="text-sm font-semibold text-neutral-900 mb-3">About</h2>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{org.description}</p>
            </Card>
          )}

          {org.opportunities.length > 0 && (
            <Card padding="none" className="overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  Open opportunities ({org.opportunities.length})
                </h2>
              </div>
              <ul className="divide-y divide-neutral-100">
                {org.opportunities.map((opp) => (
                  <li key={opp.id}>
                    <Link href={`/opportunities/${opp.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900">{opp.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <OpportunityTypeBadge type={opp.type} />
                          <WorkModeBadge mode={opp.workMode} />
                          {opp.deadline && (
                            <span className="text-xs text-neutral-400">Due {formatDate(opp.deadline)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {org.projects.length > 0 && (
            <Card padding="none" className="overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  Open projects
                </h2>
              </div>
              <ul className="divide-y divide-neutral-100">
                {org.projects.map((proj) => (
                  <li key={proj.id}>
                    <Link href={`/projects/${proj.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900">{proj.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {proj.payment && <span className="text-xs text-neutral-500">{proj.payment}</span>}
                          {proj.expectedHours && <span className="text-xs text-neutral-400">~{proj.expectedHours}h</span>}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
