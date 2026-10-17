import { prisma } from "@/lib/db";
import { getTalentMockData } from "@/lib/dashboard/mock-data";
import Link from "next/link";
import {
  Briefcase,
  FolderKanban,
  Calendar,
  CheckCircle,
  Compass,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ApplicationStatusBadge } from "@/components/ui/badge";
import { OrbitIntelligence } from "@/components/dashboard/orbit-intelligence";

export async function TalentDashboard({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  let applications: any[] = [];
  let savedOpps: any[] = [];
  let activeProjects: any[] = [];
  let upcomingEvents: any[] = [];
  let mentorshipSessions: any[] = [];
  let verifiedWork: any[] = [];
  let skillEvidence: any[] = [];
  let isDemoOffline = false;

  try {
    const results = await Promise.race([
      Promise.all([
        prisma.opportunityApplication.findMany({
          where: { userId },
          include: {
            opportunity: {
              include: { organization: { select: { name: true, slug: true } } },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 4,
        }),
        prisma.savedOpportunity.findMany({
          where: { userId },
          include: {
            opportunity: {
              include: { organization: { select: { name: true } } },
            },
          },
          orderBy: { savedAt: "desc" },
          take: 3,
        }),
        prisma.projectApplication.findMany({
          where: { userId, status: "ACCEPTED" },
          include: {
            project: {
              include: { organization: { select: { name: true } } },
            },
          },
          take: 3,
        }),
        prisma.event.findMany({
          where: {
            startDate: { gte: new Date() },
            isDeleted: false,
          },
          orderBy: { startDate: "asc" },
          take: 3,
        }),
        prisma.mentorshipSession.findMany({
          where: {
            OR: [{ mentorId: userId }, { menteeId: userId }],
            status: "SCHEDULED",
          },
          include: {
            mentor: { select: { name: true } },
            mentee: { select: { name: true } },
            request: { select: { topic: true } },
          },
          orderBy: { scheduledAt: "asc" },
          take: 2,
        }),
        prisma.verifiedWorkRecord.findMany({
          where: { userId },
          orderBy: { completionDate: "desc" },
          take: 3,
        }),
        prisma.skillEvidence.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
      ]),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("DB offline")), 1500)
      ),
    ]);

    if (results && (results[0].length > 0 || results[1].length > 0 || results[2].length > 0)) {
      [
        applications,
        savedOpps,
        activeProjects,
        upcomingEvents,
        mentorshipSessions,
        verifiedWork,
        skillEvidence,
      ] = results;
    } else {
      // Empty DB or demo user: provide rich demo dataset
      isDemoOffline = true;
      const mock = getTalentMockData();
      applications = mock.applications;
      savedOpps = mock.savedOpps;
      activeProjects = mock.activeProjects;
      upcomingEvents = mock.upcomingEvents;
      mentorshipSessions = mock.mentorshipSessions;
      verifiedWork = mock.verifiedWork;
      skillEvidence = mock.skillEvidence;
    }
  } catch {
    isDemoOffline = true;
    const mock = getTalentMockData();
    applications = mock.applications;
    savedOpps = mock.savedOpps;
    activeProjects = mock.activeProjects;
    upcomingEvents = mock.upcomingEvents;
    mentorshipSessions = mock.mentorshipSessions;
    verifiedWork = mock.verifiedWork;
    skillEvidence = mock.skillEvidence;
  }

  const firstName = name ? name.split(" ")[0] : "Candidate";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" className="text-[11px] font-semibold">
              Talent Persona
            </Badge>
            {isDemoOffline && (
              <Badge variant="amber" className="text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200">
                Offline Demo Mode
              </Badge>
            )}
            <span className="text-xs text-neutral-400">Discover · Apply · Work · Prove</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Track your verified proof of work, application pipeline, active deliverables, and advisory sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/opportunities">
            <Button size="sm" variant="primary" className="text-xs gap-1.5">
              <Briefcase className="h-4 w-4" />
              Explore Opportunities
            </Button>
          </Link>
          <Link href="/evidence/timeline">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Award className="h-4 w-4" />
              Add Evidence
            </Button>
          </Link>
        </div>
      </div>

      {/* Orbit Intelligence recommendation engine */}
      <OrbitIntelligence />

      {/* Workflow Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active Applications",
            value: applications.length,
            href: "/opportunities?tab=applications",
            icon: Briefcase,
          },
          {
            label: "Scoped Projects",
            value: activeProjects.length,
            href: "/projects",
            icon: FolderKanban,
          },
          {
            label: "Verified Work Proofs",
            value: verifiedWork.length,
            href: "/evidence/timeline",
            icon: ShieldCheck,
          },
          {
            label: "Saved Opportunities",
            value: savedOpps.length,
            href: "/opportunities?tab=saved",
            icon: Compass,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card hover className="p-4 bg-white border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  <span className="text-xs text-brand-600 font-medium">View &rarr;</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Advisory Banner if scheduled */}
      {mentorshipSessions.length > 0 && (
        <div className="p-4 bg-neutral-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700">
              <Compass className="h-5 w-5 text-neutral-200" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Upcoming Advisory: {mentorshipSessions[0].request?.topic || "Technical Architecture Review"}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                With {mentorshipSessions[0].mentor?.name} · {new Date(mentorshipSessions[0].scheduledAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Link href="/action-center">
            <Button size="sm" variant="outline" className="text-xs bg-white text-neutral-900 border-white hover:bg-neutral-100">
              Session Details
            </Button>
          </Link>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Pipeline */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-neutral-500" />
              Applications Pipeline
            </h2>
            <Link href="/opportunities?tab=applications" className="text-xs text-brand-600 font-medium hover:underline">
              View all
            </Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Discover active roles and apply with verified proof of work."
              action={
                <Link href="/opportunities">
                  <Button size="sm">Browse Opportunities</Button>
                </Link>
              }
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {applications.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/opportunities/${app.opportunityId}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {app.opportunity.title}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {app.opportunity.organization.name}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Verified Proofs of Work */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified Work Records
            </h2>
            <Link href="/evidence/timeline" className="text-xs text-brand-600 font-medium hover:underline">
              Timeline &rarr;
            </Link>
          </div>
          {verifiedWork.length === 0 ? (
            <EmptyState
              title="No verified work records yet"
              description="Complete scoped projects to earn verifiable proof of work credentials."
              action={
                <Link href="/projects">
                  <Button size="sm">Explore Scoped Projects</Button>
                </Link>
              }
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {verifiedWork.map((vw) => (
                <li key={vw.id} className="p-4 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-neutral-900">{vw.projectTitle}</p>
                    <p className="text-neutral-500 mt-0.5">
                      Issued by <span className="text-neutral-800 font-medium">{vw.orgName}</span> · {vw.userRole}
                    </p>
                    {vw.reviewText && (
                      <p className="text-neutral-600 italic mt-1 text-[11px] line-clamp-1">
                        "{vw.reviewText}"
                      </p>
                    )}
                  </div>
                  <Badge variant="green" className="text-[10px] shrink-0">
                    Verified Proof
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Active Projects */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-neutral-500" />
              Active Projects & Sprints
            </h2>
            <Link href="/projects" className="text-xs text-brand-600 font-medium hover:underline">
              Browse all
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <EmptyState
              title="No active projects"
              description="Join an engineering sprint or scoped challenge to build portfolio proof."
              action={
                <Link href="/projects">
                  <Button size="sm">Find Projects</Button>
                </Link>
              }
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {activeProjects.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/projects/${app.projectId}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {app.project.title}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {app.project.organization.name}
                      </p>
                    </div>
                    <Badge variant="blue" className="text-[10px]">In Progress</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Upcoming Ecosystem Events & Hackathons */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-500" />
              Upcoming Events & Hackathons
            </h2>
            <Link href="/events" className="text-xs text-brand-600 font-medium hover:underline">
              Calendar &rarr;
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="p-5 text-xs text-neutral-500">No scheduled events found.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {upcomingEvents.map((ev) => (
                <li key={ev.id}>
                  <Link
                    href={`/events/${ev.id}`}
                    className="p-4 flex justify-between items-center hover:bg-neutral-50 transition-colors text-xs"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900">{ev.title}</p>
                      <p className="text-neutral-500">{ev.organizerName} · {ev.format}</p>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(ev.startDate).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
