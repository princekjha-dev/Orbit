import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { ProjectCard } from "@/components/ui/orbit-cards";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects",
  description: "Discover projects where people come together to solve problems, learn and ship.",
};

interface PageProps {
  searchParams?: Promise<{ q?: string; status?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      where: { isDeleted: false, status: { in: ["OPEN", "IN_PROGRESS", "COMPLETED"] } },
      include: {
        organization: { select: { name: true, slug: true, logoUrl: true, verificationStatus: true } },
        skills: { include: { skill: true } },
        _count: { select: { applications: true, deliverables: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 24,
    });
  } catch {
    // Keep the public directory available when the database is offline.
  }

  if (projects.length === 0) {
    try {
      const { inMemoryStore } = await import("@/lib/database/in-memory-store");
      if (inMemoryStore?.projects && inMemoryStore.projects.size > 0) {
        projects = Array.from(inMemoryStore.projects.values()).filter((p: any) => !p.isDeleted);
      }
    } catch {
      // ignore
    }
  }
  if (params.q) {
    const query = params.q.toLowerCase();
    projects = projects.filter((p) => p.title?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query));
  }

  return (
    <div className="atmos-projects min-h-screen">
      <OrbitHeader title="Projects" />
      <div className="mx-auto w-full max-w-[1240px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro eyebrow="Collaborative work" title="Build something real." description="Discover projects where people come together to solve problems, learn and ship." />
        <section className="space-y-4 border-t border-[#E5E5EA] pt-7">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Projects</h2>
          {projects.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => <ProjectCard key={p.id} id={p.id} title={p.title} description={p.description || p.problem || "Collaborative project."} ownerName={p.creator?.name || p.organization?.name || "Project team"} status={p.status} membersCount={p._count?.applications || 0} />)}
            </div>
          ) : (
            <EmptyState icon={<FolderKanban />} title="No projects yet" description="New projects will appear here as teams open work to collaborators." />
          )}
        </section>
      </div>
    </div>
  );
}
