import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, Building2, Briefcase, FolderKanban, Calendar, Flag, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const [
    totalUsers,
    pendingVerifications,
    openReports,
    totalOrgs,
    totalOpps,
    totalProjects,
    openDisputes,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { isSuspended: false } }),
    prisma.organizationVerification.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.organization.count({ where: { isDeleted: false } }),
    prisma.opportunity.count({ where: { isDeleted: false } }),
    prisma.project.count({ where: { isDeleted: false } }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const stats = [
    { label: "Total users", value: totalUsers, icon: Users, href: "/admin/users" },
    { label: "Organizations", value: totalOrgs, icon: Building2, href: "/admin/organizations" },
    { label: "Opportunities", value: totalOpps, icon: Briefcase, href: "/admin/opportunities" },
    { label: "Projects", value: totalProjects, icon: FolderKanban, href: "/admin/projects" },
  ];

  const alerts = [
    { label: "Pending verifications", value: pendingVerifications, icon: ShieldCheck, href: "/admin/verifications", color: "amber" },
    { label: "Open reports", value: openReports, icon: Flag, href: "/admin/reports", color: "red" },
    { label: "Open disputes", value: openDisputes, icon: AlertTriangle, href: "/admin/disputes", color: "red" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Admin</h1>
        <p className="text-neutral-500 text-sm mt-1">Platform management and moderation.</p>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          const isWarning = alert.value > 0;
          return (
            <Link key={alert.href} href={alert.href}>
              <Card hover className={`flex items-center gap-4 ${isWarning ? "border-amber-200 bg-amber-50" : ""}`}>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isWarning ? "bg-amber-100" : "bg-neutral-100"}`}>
                  <Icon className={`h-5 w-5 ${isWarning ? "text-amber-600" : "text-neutral-500"}`} aria-hidden="true" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isWarning ? "text-amber-700" : "text-neutral-900"}`}>{alert.value}</p>
                  <p className="text-xs text-neutral-500">{alert.label}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <Card hover className="text-center p-4">
                <Icon className="h-5 w-5 text-neutral-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: "Review pending verifications", href: "/admin/verifications", urgent: pendingVerifications > 0 },
              { label: "Review open reports", href: "/admin/reports", urgent: openReports > 0 },
              { label: "Resolve open disputes", href: "/admin/disputes", urgent: openDisputes > 0 },
              { label: "Manage users", href: "/admin/users", urgent: false },
              { label: "View audit log", href: "/admin/audit", urgent: false },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  item.urgent
                    ? "bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}>
                {item.label}
                {item.urgent && (
                  <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                    Action needed
                  </span>
                )}
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent audit log */}
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Recent admin actions</h2>
          {recentLogs.length === 0 ? (
            <p className="text-xs text-neutral-500">No admin actions yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-2 text-xs">
                  <span className="font-medium text-neutral-700 flex-shrink-0">{log.actor.name}</span>
                  <span className="text-neutral-500">{log.action} {log.entityType}</span>
                  <span className="text-neutral-300 ml-auto flex-shrink-0">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
