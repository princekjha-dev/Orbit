import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Log | Admin" };

interface PageProps { searchParams: { page?: string } }

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page || "1");
  const take = 50;
  const skip = (page - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / take);

  const actionColor = (action: string): "blue" | "green" | "red" | "amber" | "neutral" => {
    if (action.includes("approve") || action.includes("verify")) return "green";
    if (action.includes("reject") || action.includes("suspend") || action.includes("delete")) return "red";
    if (action.includes("resolve")) return "blue";
    if (action.includes("dismiss")) return "amber";
    return "neutral";
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Audit log</h1>
        <p className="text-neutral-500 text-sm mt-1">{total} total entries</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Actor</th>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Action</th>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3 hidden sm:table-cell">Entity</th>
              <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{log.actor.name}</p>
                  <p className="text-xs text-neutral-400">@{log.actor.username}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={actionColor(log.action)}>{log.action.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-neutral-500">
                  {log.entityType}
                  {log.entityId && (
                    <span className="text-xs text-neutral-300 ml-1">#{log.entityId.slice(0, 8)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-400 text-xs">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-neutral-500">No audit entries yet.</p>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`/admin/audit?page=${page - 1}`}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                Previous
              </a>
            )}
            {page < totalPages && (
              <a href={`/admin/audit?page=${page + 1}`}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
