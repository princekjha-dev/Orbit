import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/ui/badge";
import { VerificationActions } from "@/components/admin/verification-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verifications | Admin" };

export default async function AdminVerificationsPage() {
  const verifications = await prisma.organizationVerification.findMany({
    where: { status: "PENDING" },
    include: {
      organization: {
        include: { members: { include: { user: { select: { name: true, email: true } } }, take: 1 } },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Organization verifications</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {verifications.length} pending request{verifications.length !== 1 ? "s" : ""}.
          Review each organization before approving.
        </p>
      </div>

      {verifications.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm font-medium text-neutral-700">No pending verifications</p>
          <p className="text-xs text-neutral-500 mt-1">All caught up.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => (
            <Card key={v.id}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-neutral-900">{v.organization.name}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    Submitted {new Date(v.submittedAt).toLocaleDateString()}
                    {v.organization.website && (
                      <> · <a href={v.organization.website} target="_blank" rel="noopener noreferrer"
                        className="text-brand-600 hover:underline">{v.organization.website}</a></>
                    )}
                  </p>
                  {v.organization.members[0] && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Contact: {v.organization.members[0].user.name} ({v.organization.members[0].user.email})
                    </p>
                  )}
                  {v.notes && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                      <p className="text-xs font-medium text-neutral-600 mb-1">Applicant notes:</p>
                      <p className="text-sm text-neutral-700">{v.notes}</p>
                    </div>
                  )}
                  {v.evidenceUrl && (
                    <a href={v.evidenceUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
                      View evidence
                    </a>
                  )}
                </div>
                <VerificationActions
                  verificationId={v.id}
                  orgId={v.organizationId}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
