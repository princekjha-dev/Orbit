import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, DollarSign, Calendar, FileText, CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ProjectApplyDialog } from "@/components/projects/project-apply-dialog";
import type { Metadata } from "next";

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: project?.title ?? "Project" };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  const [project, existingApp] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id, isDeleted: false },
      include: {
        organization: {
          select: { name: true, slug: true, logoUrl: true, verificationStatus: true },
        },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    }),
    user
      ? prisma.projectApplication.findUnique({
          where: { projectId_userId: { projectId: params.id, userId: user.id! } },
        })
      : null,
  ]);

  if (!project) notFound();

  const canApply =
    user &&
    (user as any).role === "STUDENT" &&
    !existingApp &&
    project.status === "OPEN";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{project.title}</h1>
                <p className="text-sm text-neutral-500 mt-1">
                  {project.organization.name}
                  {project.organization.verificationStatus === "VERIFIED" && (
                    <span className="ml-1.5 text-green-700">✓ Verified</span>
                  )}
                </p>
              </div>
              <Badge variant={project.status === "OPEN" ? "green" : project.status === "IN_PROGRESS" ? "blue" : "neutral"}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-neutral-100">
              {project.expectedHours && (
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Estimated work</p>
                  <p className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                    {project.expectedHours} hours
                  </p>
                </div>
              )}
              {project.payment && (
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Payment</p>
                  <p className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                    {project.payment}
                  </p>
                </div>
              )}
              {project.deadline && (
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Deadline</p>
                  <p className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                    {formatDate(project.deadline)}
                  </p>
                </div>
              )}
            </div>

            {project.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-neutral-400 mb-2">Required skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.skills.map((s) => (
                    <Badge key={s.skillId} variant="neutral">{s.skill.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              Problem statement
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{project.problem}</p>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-neutral-900 mb-3">Scope of work</h2>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{project.scope}</p>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              Expected deliverable
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{project.deliverable}</p>
            {project.acceptanceCriteria && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Acceptance criteria</p>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{project.acceptanceCriteria}</p>
              </div>
            )}
          </Card>

          {project.ipTerms && (
            <Card>
              <h2 className="text-sm font-semibold text-neutral-900 mb-2">IP terms</h2>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{project.ipTerms}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            {existingApp ? (
              <div>
                <p className="text-sm font-medium text-neutral-900 mb-1">Application submitted</p>
                <Badge variant={existingApp.status === "ACCEPTED" ? "green" : existingApp.status === "REJECTED" ? "red" : "blue"}>
                  {existingApp.status}
                </Badge>
              </div>
            ) : canApply ? (
              <ProjectApplyDialog projectId={project.id} />
            ) : !user ? (
              <>
                <p className="text-sm text-neutral-700 mb-3">Sign in to apply for this project.</p>
                <Link href="/login"><Button className="w-full">Sign in to apply</Button></Link>
              </>
            ) : project.status !== "OPEN" ? (
              <p className="text-sm text-neutral-500">This project is no longer accepting applications.</p>
            ) : (
              <p className="text-sm text-neutral-500">Only students can apply to projects.</p>
            )}
          </Card>

          <Card>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Organization</p>
            <Link href={`/org/${project.organization.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-500 flex-shrink-0">
                {project.organization.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{project.organization.name}</p>
                <p className="text-xs text-neutral-500">{project.organization.verificationStatus === "VERIFIED" ? "Verified organization" : "Unverified"}</p>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
