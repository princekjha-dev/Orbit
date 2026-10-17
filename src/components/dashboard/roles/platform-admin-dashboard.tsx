import { prisma } from "@/lib/db";
import { getPlatformAdminMockData } from "@/lib/dashboard/mock-data";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Building2,
  FileCheck,
  AlertTriangle,
  Scale,
  Activity,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export async function PlatformAdminDashboard({ userId }: { userId: string }) {
  let userCount = 0;
  let orgCount = 0;
  let pendingVerifications: any[] = [];
  let openReports: any[] = [];
  let openDisputes: any[] = [];
  let recentAuditLogs: any[] = [];
  let isDemoOffline = false;

  try {
    const results = await Promise.race([
      Promise.all([
        prisma.user.count(),
        prisma.organization.count(),
        prisma.organizationVerification.findMany({
          where: { status: "PENDING" },
          include: { organization: { select: { name: true, slug: true } } },
          take: 4,
        }),
        prisma.report.findMany({
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        prisma.dispute.findMany({
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
        prisma.auditLog.findMany({
          include: {
            actor: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("DB offline")), 1500)
      ),
    ]);

    if (results && (results[0] > 0 || results[1] > 0 || results[2].length > 0)) {
      [
        userCount,
        orgCount,
        pendingVerifications,
        openReports,
        openDisputes,
        recentAuditLogs,
      ] = results;
    } else {
      isDemoOffline = true;
      const mock = getPlatformAdminMockData();
      userCount = mock.userCount;
      orgCount = mock.orgCount;
      pendingVerifications = mock.pendingVerifications;
      openReports = mock.openReports;
      openDisputes = mock.openDisputes;
      recentAuditLogs = mock.recentAuditLogs;
    }
  } catch {
    isDemoOffline = true;
    const mock = getPlatformAdminMockData();
    userCount = mock.userCount;
    orgCount = mock.orgCount;
    pendingVerifications = mock.pendingVerifications;
    openReports = mock.openReports;
    openDisputes = mock.openDisputes;
    recentAuditLogs = mock.recentAuditLogs;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="red" className="text-[11px] font-semibold bg-red-700 text-white">
              Platform Admin Persona
            </Badge>
            {isDemoOffline && (
              <Badge variant="amber" className="text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200">
                Offline Demo Mode
              </Badge>
            )}
            <span className="text-xs text-neutral-400">Trust & Safety Operations · Audit · Verification</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Platform Administration & Governance
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Oversee ecosystem integrity, review pending organization verifications, resolve disputes, and monitor audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/verifications">
            <Button size="sm" variant="primary" className="text-xs gap-1.5">
              <FileCheck className="h-4 w-4" />
              Verification Queue ({pendingVerifications.length})
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Moderation ({openReports.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Platform Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Registered Users",
            value: userCount,
            href: "/admin/users",
            icon: Users,
          },
          {
            label: "Ecosystem Organizations",
            value: orgCount,
            href: "/admin/organizations",
            icon: Building2,
          },
          {
            label: "Pending Verifications",
            value: pendingVerifications.length,
            href: "/admin/verifications",
            icon: FileCheck,
          },
          {
            label: "Open Reports",
            value: openReports.length,
            href: "/admin/reports",
            icon: AlertTriangle,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card hover className="p-4 bg-white border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-neutral-400" />
                  <span className="text-xs text-brand-600 font-medium">Inspect &rarr;</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Access Admin Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Organization Verifications",
            desc: "Review business credentials and verify company entities",
            href: "/admin/verifications",
            icon: FileCheck,
          },
          {
            label: "Trust & Safety Reports",
            desc: "Moderate user reports and investigate suspicious activity",
            href: "/admin/reports",
            icon: AlertTriangle,
          },
          {
            label: "System Audit Logs",
            desc: "Cryptographically traced administrative and access telemetry",
            href: "/admin/audit",
            icon: ShieldCheck,
          },
        ].map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.label} href={tool.href}>
              <Card hover className="p-4 flex items-start gap-3 bg-white border border-neutral-200 shadow-xs">
                <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{tool.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{tool.desc}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 2-Column: Pending Verifications & Audit Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-neutral-500" />
              Pending Organization Verifications
            </h3>
            <Link href="/admin/verifications" className="text-xs text-brand-600 font-medium hover:underline">
              Review all &rarr;
            </Link>
          </div>

          {pendingVerifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No organization verifications currently pending.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {pendingVerifications.map((v) => (
                <li key={v.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-neutral-900">{v.organization.name}</p>
                    <p className="text-neutral-500 text-[11px] mt-0.5">org/{v.organization.slug}</p>
                  </div>
                  <Badge variant="neutral" className="text-[10px]">
                    Pending Review
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Audit Log Stream */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neutral-500" />
              Recent System Audit Logs
            </h3>
            <Link href="/admin/audit" className="text-xs text-brand-600 font-medium hover:underline">
              Full logs &rarr;
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">No recent audit records.</div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentAuditLogs.map((log) => (
                <li key={log.id} className="p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-neutral-900 text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Actor: {log.actor?.name || log.actorId} · Entity: {log.entityType}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
