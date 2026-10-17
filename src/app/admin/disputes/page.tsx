import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { DisputeActions } from "@/components/admin/dispute-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disputes | Admin" };

export default async function AdminDisputesPage() {
  const disputes = await prisma.dispute.findMany({
    where: { status: "OPEN" },
    include: {
      raisedBy: { select: { name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 30,
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Disputes</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {disputes.length} open dispute{disputes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {disputes.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm font-medium text-neutral-700">No open disputes</p>
          <p className="text-xs text-neutral-500 mt-1">All caught up.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={d.raisedBy.image} name={d.raisedBy.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{d.raisedBy.name}</p>
                      <p className="text-xs text-neutral-500">{d.raisedBy.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="red">{d.status}</Badge>
                    <span className="text-xs text-neutral-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-sm font-semibold text-neutral-900 mb-1">
                    {d.subject}
                  </p>
                  {d.projectId && (
                    <p className="text-xs text-neutral-500 mb-1">
                      Project ID: <span className="text-neutral-500 font-mono">{d.projectId}</span>
                    </p>
                  )}

                  <div className="p-3 bg-neutral-50 rounded-lg mt-2">
                    <p className="text-sm text-neutral-700">{d.description}</p>
                  </div>
                </div>
                <DisputeActions disputeId={d.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
