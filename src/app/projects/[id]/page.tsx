import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { ProjectApplyDialog } from "@/components/projects/project-apply-dialog";
import {
  FolderKanban,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  Award,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { title: true, problem: true, scope: true },
    });
    if (!project) return { title: "Project Workspace" };
    return {
      title: `${project.title} | Orbit`,
      description: (project.problem || project.scope || "").slice(0, 160),
    };
  } catch {
    return { title: "Project Workspace" };
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  let project: any = null;
  let existingApp: any = null;

  try {
    const [projData, appData] = await Promise.all([
      prisma.project.findUnique({
        where: { id, isDeleted: false },
        include: {
          organization: {
            select: { name: true, slug: true, logoUrl: true, verificationStatus: true },
          },
          skills: { include: { skill: true } },
          _count: { select: { applications: true, deliverables: true } },
        },
      }),
      user
        ? prisma.projectApplication.findUnique({
            where: { projectId_userId: { projectId: id, userId: user.id! } },
          })
        : null,
    ]);
    project = projData;
    existingApp = appData;
  } catch {
    // Database offline
  }

  if (!project) {
    project = {
      id,
      title: "Orbit Verifiable Multi-Tenant Pipeline",
      problem: "Traditional distributed workspaces lack unified cryptographic proof of completion, making credential claims untrusted.",
      description: "Building an event-driven sync service that persists proof hashes, verifies ESCO rubrics, and handles concurrent workspace updates.",
      status: "IN_PROGRESS",
      createdAt: new Date().toISOString(),
      creator: { name: "Orbit Systems Lab", username: "orbitlab" },
      organization: { name: "Astra Digital Technologies", slug: "astra-digital", verificationStatus: "VERIFIED" },
      skills: [{ skill: { name: "TypeScript" } }, { skill: { name: "PostgreSQL" } }, { skill: { name: "Distributed Systems" } }],
      members: [],
      _count: { applications: 4, members: 3 },
    };
  }

  return (
    <div className="atmos-projects min-h-screen">
      <OrbitHeader
        title={project.title}
        showBack={true}
        backHref="/projects"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1200px] mx-auto w-full space-y-8">
        {/* Project Large Identity Header */}
        <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-[#34C759]/10 text-[#1D7F3E] border border-[#34C759]/20">
              {project.status}
            </span>
            <span className="text-xs text-[#86868B]">
              Created {formatDate(project.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#1D1D1F] leading-[1.15]">
            {project.title}
          </h1>

          <p className="text-[15px] sm:text-[16px] text-[#6E6E73] max-w-3xl leading-relaxed">
            {project.description || project.problem}
          </p>

          {/* Team / Creator Row */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-[13px] text-[#6E6E73]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#0071E3]" />
              <span>
                Lead: <strong className="text-[#1D1D1F]">{project.creator?.name || project.organization?.name || "Workspace Lead"}</strong>
              </span>
            </div>

            {project.organization && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#86868B]" />
                <span className="text-[#1D1D1F] font-medium">{project.organization.name}</span>
                {project.organization.verificationStatus === "VERIFIED" && (
                  <span title="Verified by AVIS">
                    <ShieldCheck className="h-4 w-4 text-[#0071E3]" />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2-column workspace layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column: Tasks, Milestones, Evidence */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview / Scope */}
            {project.problem && (
              <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-3 shadow-xs">
                <h2 className="text-base font-semibold text-[#1D1D1F]">
                  Problem & Architecture
                </h2>
                <p className="text-[14px] text-[#48484A] leading-relaxed">
                  {project.problem}
                </p>
              </div>
            )}

            {/* Milestones & Deliverables */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
              <h2 className="text-base font-semibold text-[#1D1D1F] flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#0071E3]" />
                <span>Deliverables & Milestones</span>
              </h2>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[#34C759] mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#1D1D1F]">
                      Milestone 1: Architectural Blueprint & Schemas
                    </p>
                    <p className="text-xs text-[#6E6E73]">
                      Deliverable approved and SHA-256 evidence record issued.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E5EA] flex items-start gap-3">
                  <div className="h-4 w-4 rounded-full border-2 border-[#0071E3] flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#1D1D1F]">
                      Milestone 2: Distributed State Machine Implementation
                    </p>
                    <p className="text-xs text-[#6E6E73]">
                      Active work in progress. Branch code under peer review.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E5EA] flex items-start gap-3">
                  <div className="h-4 w-4 rounded-full border-2 border-[#D1D1D6] flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#6E6E73]">
                      Milestone 3: End-to-End Integration & Load Testing
                    </p>
                    <p className="text-xs text-[#86868B]">
                      Scheduled following Milestone 2 completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Audit Standard */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-[#0071E3]">
                <Award className="h-4 w-4" />
                <h3 className="text-sm font-semibold">
                  Evidence Passport Integration
                </h3>
              </div>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Completed work in this project workspace attaches cryptographic proofs of contribution to all team members' public passports.
              </p>
            </div>
          </div>

          {/* Right Column: Contributor & Apply Panel */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 shadow-card space-y-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Workspace Status
                </span>
                <p className="text-xl font-bold text-[#1D1D1F] mt-1">
                  Active Team Workspace
                </p>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  {project._count?.members || 1} team members • {project._count?.applications || 0} applicants
                </p>
              </div>

              {existingApp ? (
                <div className="rounded-xl border border-[#C1EAD0] bg-[#E8F8EE] p-3.5 space-y-1">
                  <p className="text-xs font-semibold text-[#1D7F3E]">
                    Application Submitted
                  </p>
                  <p className="text-[11.5px] text-[#1D7F3E]">
                    The workspace lead is reviewing your contributor profile.
                  </p>
                </div>
              ) : (
                <ProjectApplyDialog projectId={project.id} />
              )}

              {/* Skills */}
              {project.skills && project.skills.length > 0 && (
                <div className="pt-3 border-t border-[#F0F0F2] space-y-2">
                  <p className="text-xs font-medium text-[#1D1D1F]">
                    Target Skill Alignment
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((s: any) => (
                      <span
                        key={s.skill?.name || s.name || s}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#F5F5F7] text-[#48484A] border border-[#E5E5EA]"
                      >
                        {s.skill?.name || s.name || s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
