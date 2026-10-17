import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "@/components/admin/report-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports | Admin" };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: "OPEN" },
    include: {
      reporter: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 30,
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
        <p className="text-neutral-500 text-sm mt-1">{reports.length} open report{reports.length !== 1 ? "s" : ""}</p>
      </div>

      {reports.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm font-medium text-neutral-700">No open reports</p>
          <p className="text-xs text-neutral-500 mt-1">All caught up.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="red">{report.reason}</Badge>
                    <Badge variant="neutral">{report.entityType}</Badge>
                  </div>
                  <p className="text-sm font-medium text-neutral-900 mb-1">
                    Reported by: {report.reporter.name} ({report.reporter.email})
                  </p>
                  <p className="text-xs text-neutral-500 mb-2">
                    {new Date(report.createdAt).toLocaleDateString()} · Entity ID: {report.entityId}
                  </p>
                  {report.description && (
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-700">{report.description}</p>
                    </div>
                  )}
                </div>
                <ReportActions reportId={report.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
