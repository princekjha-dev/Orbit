"use client";

import { useState } from "react";
import { VerificationRecordData } from "@/lib/avis/avis-service";
import { AvisTrustBadge } from "./trust-badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

interface ReviewQueueClientProps {
  initialQueue: Array<VerificationRecordData & { slaHoursRemaining: number }>;
}

export function ReviewQueueClient({ initialQueue }: ReviewQueueClientProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [activeRecord, setActiveRecord] = useState<(VerificationRecordData & { slaHoursRemaining: number }) | null>(null);
  const [decision, setDecision] = useState<"VERIFY" | "REJECT" | "SUSPECT" | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openDecisionModal = (
    record: VerificationRecordData & { slaHoursRemaining: number },
    targetDecision: "VERIFY" | "REJECT" | "SUSPECT"
  ) => {
    setActiveRecord(record);
    setDecision(targetDecision);
    setReason("");
    setErrorMsg(null);
  };

  const handleConfirmDecision = async () => {
    if (!activeRecord || !decision) return;
    if (reason.trim().length < 10) {
      setErrorMsg("Please provide at least 10 characters detailing your review reason.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/orbitmod/avis/reviews/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: activeRecord.id,
          decision,
          reason,
          subjectUserId: activeRecord.resourceId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Remove from pending queue on successful verdict
        setQueue((prev) => prev.filter((r) => r.id !== activeRecord.id));
        setActiveRecord(null);
        setDecision(null);
      } else {
        setErrorMsg(data.error || "Failed to submit decision");
      }
    } catch {
      setErrorMsg("Network error submitting decision");
    } finally {
      setSubmitting(false);
    }
  };

  if (queue.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900">Review Queue Clear</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          All submitted organizations and opportunities have completed verification review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Pending Human Review Queue</h2>
          <p className="text-xs text-neutral-500">Items requiring human reviewer determination under 48h SLA</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {queue.length} Pending
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3 font-semibold">Subject / Resource</th>
              <th className="px-4 py-3 font-semibold">Current State</th>
              <th className="px-4 py-3 font-semibold">Evidence Rows</th>
              <th className="px-4 py-3 font-semibold">SLA Window</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {queue.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-bold text-neutral-900">{item.resourceName || item.resourceId}</div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{item.resourceType} • {item.id}</div>
                </td>
                <td className="px-4 py-3.5">
                  <AvisTrustBadge state={item.state} />
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-neutral-700 font-medium">
                    {item.evidence.length} artifact{item.evidence.length === 1 ? "" : "s"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span className={item.slaHoursRemaining <= 6 ? "text-red-600 font-bold" : "font-medium"}>
                      {item.slaHoursRemaining}h remaining
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right space-x-2">
                  <Button
                    onClick={() => openDecisionModal(item, "VERIFY")}
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Verify
                  </Button>
                  <Button
                    onClick={() => openDecisionModal(item, "SUSPECT")}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                  >
                    Flag
                  </Button>
                  <Button
                    onClick={() => openDecisionModal(item, "REJECT")}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-red-700 border-red-300 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decision Reason Modal */}
      {activeRecord && decision && (
        <Dialog
          open={true}
          onClose={() => setActiveRecord(null)}
          title={`Confirm Reviewer Decision: ${decision} on ${activeRecord.resourceName || activeRecord.resourceId}`}
          description="A documented reason is strictly required. This explanation is persisted to the audit trail and displayed transparently to the subject."
        >
          <div className="space-y-4 py-2">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail the evidence verified, domain records confirmed, or risk indicators observed..."
              rows={4}
              className="text-xs"
            />

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveRecord(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirmDecision} disabled={submitting}>
                {submitting ? "Recording Decision..." : "Submit Audited Decision"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
