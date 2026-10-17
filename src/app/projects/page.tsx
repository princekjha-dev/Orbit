import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import Link from "next/link";
import { Search, Clock, DollarSign, FolderKanban, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Find scoped, paid projects posted by organizations on Orbit.",
};

interface PageProps {
  searchParams: { q?: string; status?: string };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const role = (user as any)?.role;

  const where: any = {
    isDeleted: false,
    status: { in: ["OPEN", "IN_PROGRESS"] },
  };

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { problem: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      organization: {
        select: { name: true, slug: true, logoUrl: true, verificationStatus: true },
      },
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Project marketplace</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Scoped, paid projects with clear deliverables and acceptance criteria.
          </p>
        </div>
        {(role === "FOUNDER" || role === "ADMIN") && (
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Post project
            </Button>
          </Link>
        )}
      </div>

      {/* Notice banner */}
      <div className="mb-6 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-sm text-blue-800">
          <strong>All projects on Orbit are paid.</strong> We do not facilitate unpaid labor.
          Each project listing includes payment terms, scope, and acceptance criteria upfront.
        </p>
      </div>

      {/* Search */}
      <form method="get" className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search projects by skill or keyword..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Search projects"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban />}
          title="No projects found"
          description={
            searchParams.q
              ? "Try a different search term"
              : "Check back soon for new scoped projects"
          }
        />
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block">
              <Card hover className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-neutral-500">
                    {project.organization.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.organization.logoUrl}
                        alt={project.organization.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      project.organization.name[0]
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900">
                          {project.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {project.organization.name}
                          {project.organization.verificationStatus === "VERIFIED" && (
                            <span className="ml-1.5 text-green-700 inline-flex items-center gap-0.5">
                              ✓ Verified
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          project.status === "OPEN"
                            ? "green"
                            : project.status === "IN_PROGRESS"
                            ? "blue"
                            : "neutral"
                        }
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                      {project.problem}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-neutral-500">
                      {project.expectedHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          ~{project.expectedHours}h
                        </span>
                      )}
                      {project.payment && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" aria-hidden="true" />
                          {project.payment}
                        </span>
                      )}
                      {project.deadline && (
                        <span>Due {formatDate(project.deadline)}</span>
                      )}
                      <span>{project._count.applications} applicant{project._count.applications !== 1 ? "s" : ""}</span>
                    </div>

                    {project.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.skills.slice(0, 5).map((s) => (
                          <Badge key={s.skillId} variant="neutral">
                            {s.skill.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
