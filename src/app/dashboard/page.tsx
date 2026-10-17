import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import {
  Briefcase,
  FolderKanban,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ApplicationStatusBadge, OpportunityTypeBadge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireAuth();
  const role = (user as any).role;

  if (role === "ADMIN") {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
        <p className="text-neutral-500 mb-6">Manage the Orbit platform.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Manage Organizations", href: "/admin/organizations", icon: Briefcase },
            { label: "Review Verifications", href: "/admin/verifications", icon: CheckCircle },
            { label: "View Reports", href: "/admin/reports", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card hover className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-neutral-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                    <p className="text-xs text-neutral-500">Admin action</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  if (role === "FOUNDER") {
    return <FounderDashboard userId={user.id!} />;
  }

  return <StudentDashboard userId={user.id!} name={user.name!} />;
}

async function StudentDashboard({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [applications, savedOpps, activeProjects, upcomingEvents] =
    await Promise.all([
      prisma.opportunityApplication.findMany({
        where: { userId },
        include: {
          opportunity: {
            include: { organization: { select: { name: true } } },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.savedOpportunity.findMany({
        where: { userId },
        include: {
          opportunity: {
            include: { organization: { select: { name: true } } },
          },
        },
        orderBy: { savedAt: "desc" },
        take: 5,
      }),
      prisma.projectApplication.findMany({
        where: { userId, status: "ACCEPTED" },
        include: {
          project: {
            include: { organization: { select: { name: true } } },
          },
        },
        take: 4,
      }),
      prisma.event.findMany({
        where: {
          startDate: { gte: new Date() },
          isDeleted: false,
        },
        orderBy: { startDate: "asc" },
        take: 4,
      }),
    ]);

  const greeting = getGreeting();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          {greeting}, {name.split(" ")[0]}
        </h1>
        <p className="text-neutral-500 mt-1">
          Here is where you stand today.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Applications",
            value: applications.length,
            href: "/opportunities?tab=applications",
            icon: Briefcase,
          },
          {
            label: "Saved",
            value: savedOpps.length,
            href: "/opportunities?tab=saved",
            icon: Clock,
          },
          {
            label: "Active projects",
            value: activeProjects.length,
            href: "/projects",
            icon: FolderKanban,
          },
          {
            label: "Upcoming events",
            value: upcomingEvents.length,
            href: "/events",
            icon: Calendar,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card hover className="text-center p-4">
                <Icon
                  className="h-5 w-5 text-neutral-400 mx-auto mb-2"
                  aria-hidden="true"
                />
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">
              Application pipeline
            </h2>
            <Link
              href="/opportunities?tab=applications"
              className="text-xs text-brand-600 font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="No applications yet"
              description="Browse opportunities and start applying"
              action={
                <Link href="/opportunities">
                  <Button size="sm">Browse opportunities</Button>
                </Link>
              }
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

        {/* Active projects */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">
              Active projects
            </h2>
            <Link
              href="/projects"
              className="text-xs text-brand-600 font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban />}
              title="No active projects"
              description="Find scoped projects in the project marketplace"
              action={
                <Link href="/projects">
                  <Button size="sm">Browse projects</Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {activeProjects.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/projects/${app.projectId}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {app.project.title}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {app.project.organization.name}
                      </p>
                    </div>
                    {app.project.deadline && (
                      <p className="text-xs text-neutral-400 flex-shrink-0">
                        Due {formatDate(app.project.deadline)}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Upcoming events */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">
              Upcoming events
            </h2>
            <Link
              href="/events"
              className="text-xs text-brand-600 font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar />}
              title="No upcoming events"
              description="Check back later for hackathons and meetups"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex flex-col items-center justify-center flex-shrink-0 text-center">
                      <p className="text-xs font-bold text-neutral-700">
                        {new Date(event.startDate).toLocaleDateString("en", { month: "short" }).toUpperCase()}
                      </p>
                      <p className="text-sm font-bold text-neutral-900">
                        {new Date(event.startDate).getDate()}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {event.format === "ONLINE" ? "Online" : event.city || "Location TBD"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Quick links */}
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">
            Quick actions
          </h2>
          <div className="space-y-2">
            {[
              { label: "Browse new opportunities", href: "/opportunities", icon: Briefcase },
              { label: "Find a project to work on", href: "/projects", icon: FolderKanban },
              { label: "Discover events nearby", href: "/events", icon: Calendar },
              { label: "Update your profile", href: "/profile", icon: ArrowRight },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                >
                  <Icon className="h-4 w-4 text-neutral-400 group-hover:text-brand-600 transition-colors" aria-hidden="true" />
                  <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-neutral-300 ml-auto group-hover:text-neutral-500 transition-colors" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

async function FounderDashboard({ userId }: { userId: string }) {
  const orgs = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          opportunities: {
            where: { isActive: true, isDeleted: false },
            include: { _count: { select: { applications: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          projects: {
            where: { isDeleted: false, status: { in: ["OPEN", "IN_PROGRESS"] } },
            include: { _count: { select: { applications: true } } },
            take: 5,
          },
          verification: true,
        },
      },
    },
  });

  const hasOrg = orgs.length > 0;
  const org = hasOrg ? orgs[0].organization : null;

  if (!hasOrg || !org) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Welcome to Orbit</h1>
          <p className="text-neutral-500 mt-1">
            Set up your organization to start posting opportunities.
          </p>
        </div>
        <Card className="max-w-md">
          <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6 text-brand-600" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">
            Create your organization
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            Set up an organization profile to post jobs, internships, and scoped projects.
          </p>
          <Link href="/org/new">
            <Button>
              Create organization
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">{org.name}</h1>
        <p className="text-neutral-500 mt-1">Organization dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active opportunities */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Active opportunities</h2>
            <Link href={`/org/${org.slug}/opportunities/new`}>
              <Button size="sm">Post new</Button>
            </Link>
          </div>
          {org.opportunities.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="No active opportunities"
              description="Post a job, internship, or startup role"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {org.opportunities.map((opp) => (
                <li key={opp.id}>
                  <Link
                    href={`/opportunities/${opp.id}/applications`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">{opp.title}</p>
                      <p className="text-xs text-neutral-500">{opp.type.replace("_", " ")}</p>
                    </div>
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {opp._count.applications} application{opp._count.applications !== 1 ? "s" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Active projects */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Active projects</h2>
            <Link href={`/org/${org.slug}/projects/new`}>
              <Button size="sm">Post project</Button>
            </Link>
          </div>
          {org.projects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban />}
              title="No active projects"
              description="Post a scoped project for contributors"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {org.projects.map((proj) => (
                <li key={proj.id}>
                  <Link
                    href={`/projects/${proj.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">{proj.title}</p>
                      <p className="text-xs text-neutral-500">{proj.status.replace("_", " ")}</p>
                    </div>
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {proj._count.applications} application{proj._count.applications !== 1 ? "s" : ""}
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
