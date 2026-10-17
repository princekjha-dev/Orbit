import { prisma } from "@/lib/db";
import { getFounderMockData } from "@/lib/dashboard/mock-data";
import Link from "next/link";
import {
  Rocket,
  Briefcase,
  FolderKanban,
  Users2,
  Lightbulb,
  Plus,
  ArrowRight,
  Target,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export async function FounderDashboard({ userId }: { userId: string }) {
  let startups: any[] = [];
  let orgMemberships: any[] = [];
  let collabRequests: any[] = [];
  let candidateApps: any[] = [];
  let isDemoOffline = false;

  try {
    const results = await Promise.race([
      Promise.all([
        prisma.startup.findMany({
          where: {
            OR: [{ creatorId: userId }, { members: { some: { userId } } }],
          },
          include: {
            milestones: { orderBy: { dueDate: "asc" }, take: 4 },
            hiringNeeds: { take: 3 },
            _count: { select: { members: true, milestones: true, tasks: true } },
          },
          take: 2,
        }),
        prisma.organizationMember.findMany({
          where: { userId },
          include: {
            organization: {
              include: {
                opportunities: {
                  where: { isActive: true, isDeleted: false },
                  include: { _count: { select: { applications: true } } },
                  orderBy: { createdAt: "desc" },
                  take: 4,
                },
                projects: {
                  where: { isDeleted: false },
                  include: { _count: { select: { applications: true } } },
                  take: 3,
                },
              },
            },
          },
        }),
        prisma.collaborationRequest.findMany({
          where: { receiverId: userId, status: "PROPOSED" },
          include: {
            sender: { select: { id: true, name: true, username: true, image: true } },
          },
          take: 3,
        }),
        prisma.opportunityApplication.findMany({
          where: {
            opportunity: {
              organization: {
                members: { some: { userId } },
              },
            },
          },
          include: {
            opportunity: { select: { title: true } },
            user: { select: { name: true, email: true, username: true } },
          },
          orderBy: { appliedAt: "desc" },
          take: 4,
        }),
      ]),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("DB offline")), 1500)
      ),
    ]);

    if (results && (results[0].length > 0 || results[1].length > 0)) {
      [startups, orgMemberships, collabRequests, candidateApps] = results;
    } else {
      isDemoOffline = true;
      const mock = getFounderMockData();
      startups = mock.startups;
      orgMemberships = mock.orgMemberships;
      collabRequests = mock.collabRequests;
      candidateApps = mock.candidateApps;
    }
  } catch {
    isDemoOffline = true;
    const mock = getFounderMockData();
    startups = mock.startups;
    orgMemberships = mock.orgMemberships;
    collabRequests = mock.collabRequests;
    candidateApps = mock.candidateApps;
  }

  const activeStartup = startups[0] || null;
  const activeOrg = orgMemberships[0]?.organization || null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" className="text-[11px] font-semibold bg-neutral-900 text-white">
              Founder Persona
            </Badge>
            {isDemoOffline && (
              <Badge variant="amber" className="text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200">
                Offline Demo Mode
              </Badge>
            )}
            <span className="text-xs text-neutral-400">Venture Builder · Team Formation · Milestones</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Founder & Venture Workspace
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage your startup milestones, open roles, candidate pipeline, and technical sprint deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/ecosystem">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Search className="h-4 w-4" />
              Find Talent
            </Button>
          </Link>
          {activeOrg ? (
            <Link href={`/org/${activeOrg.slug}/opportunities/new`}>
              <Button size="sm" variant="primary" className="text-xs gap-1.5">
                <Plus className="h-4 w-4" />
                Create Opportunity
              </Button>
            </Link>
          ) : (
            <Link href="/startups/new">
              <Button size="sm" variant="primary" className="text-xs gap-1.5">
                <Rocket className="h-4 w-4" />
                Create Startup
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Collaboration Requests Banner */}
      {collabRequests.length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Users2 className="h-4 w-4 text-amber-700 shrink-0" />
            <span className="font-medium text-amber-950">
              You have {collabRequests.length} pending collaboration proposal{collabRequests.length !== 1 ? "s" : ""} from ecosystem builders.
            </span>
          </div>
          <Link href="/collaborations">
            <Button size="sm" variant="outline" className="text-xs bg-white">
              Review Proposals
            </Button>
          </Link>
        </div>
      )}

      {/* Startup Profile Card */}
      {activeStartup ? (
        <Card className="p-6 bg-white border border-neutral-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                  {activeStartup.name}
                </h2>
                <Badge variant="blue" className="text-[10px]">
                  Stage: {activeStartup.stage}
                </Badge>
                <Badge variant="neutral" className="text-[10px]">
                  {activeStartup.industry}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                {activeStartup.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/startups/${activeStartup.slug}/workspace`}>
                <Button size="sm" variant="outline" className="text-xs">
                  Workspace &rarr;
                </Button>
              </Link>
            </div>
          </div>

          {/* Startup Key Milestones */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-neutral-500" />
                Active Milestones
              </h3>
              <span className="text-[11px] text-neutral-400">
                {activeStartup._count.milestones} total milestones
              </span>
            </div>

            {activeStartup.milestones.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">No active milestones created.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeStartup.milestones.map((ms: any) => (
                  <div
                    key={ms.id}
                    className="p-3.5 rounded-lg border border-neutral-100 bg-neutral-50/60 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">{ms.title}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                        {ms.description}
                      </p>
                    </div>
                    <Badge variant={ms.status === "COMPLETED" ? "green" : "blue"} className="text-[10px] shrink-0">
                      {ms.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center bg-white border border-neutral-200">
          <Rocket className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900">No Startup Workspace Created</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto mb-4">
            Initialize your venture profile to post founding team roles, define milestones, and track talent.
          </p>
          <Link href="/startups/new">
            <Button size="sm">Create Startup Profile</Button>
          </Link>
        </Card>
      )}

      {/* 2-Column Grid: Opportunities & Candidate Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Opportunities */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-neutral-500" />
              Open Venture Roles
            </h3>
            {activeOrg && (
              <Link href={`/org/${activeOrg.slug}/opportunities/new`} className="text-xs text-brand-600 font-medium hover:underline">
                + New Role
              </Link>
            )}
          </div>

          {!activeOrg || activeOrg.opportunities.length === 0 ? (
            <EmptyState
              title="No open roles"
              description="Post a founding role or engineering contract."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {activeOrg.opportunities.map((opp: any) => (
                <li key={opp.id}>
                  <Link
                    href={`/opportunities/${opp.id}/applications`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">{opp.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{opp.type ? opp.type.replace("_", " ") : "ROLE"}</p>
                    </div>
                    <Badge variant="neutral" className="text-[11px] shrink-0 font-medium">
                      {opp._count.applications} applicant{opp._count.applications !== 1 ? "s" : ""}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent Candidate Applications */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Users2 className="h-4 w-4 text-neutral-500" />
              Candidate Inflow
            </h3>
            <Link href="/opportunities?tab=applications" className="text-xs text-brand-600 font-medium hover:underline">
              View pipeline &rarr;
            </Link>
          </div>

          {candidateApps.length === 0 ? (
            <EmptyState
              title="No applicants yet"
              description="Candidates will appear here as they apply with verifiable proof of work."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {candidateApps.map((app) => (
                <li key={app.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-neutral-900">{app.user.name}</p>
                    <p className="text-neutral-500 mt-0.5">Applied to {app.opportunity.title}</p>
                  </div>
                  <Badge variant="blue" className="text-[10px]">
                    {app.status.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
