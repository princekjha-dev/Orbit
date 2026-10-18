"use client";

import { useState } from "react";
import { ScoutTeamData, TeamInviteData } from "@/lib/scout/scout-service";
import { TeamAllocationResult } from "@/lib/scout/matching-engine";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Send, CheckCircle2, AlertCircle, Shield } from "lucide-react";

interface TeamBuilderClientProps {
  initialTeam: ScoutTeamData;
}

export function TeamBuilderClient({ initialTeam }: TeamBuilderClientProps) {
  const [team, setTeam] = useState<ScoutTeamData>(initialTeam);
  const [allocation, setAllocation] = useState<TeamAllocationResult | null>(null);
  const [allocating, setAllocating] = useState(false);
  const [invitingSlotId, setInvitingSlotId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleRunAllocation = async () => {
    setAllocating(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/orbitmod/scout/teams/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id, targetHoursPerWeek: 20 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Allocation failed");
      }
      const data: TeamAllocationResult = await res.json();
      setAllocation(data);
      setStatusMessage({
        text: `Optimal allocation complete! Team Coverage: ${data.teamCoverageScore}%.`,
        type: "success",
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: "error" });
    } finally {
      setAllocating(false);
    }
  };

  const handleSendInvite = async (candidateId: string, roleName: string, slotId: string) => {
    setInvitingSlotId(slotId);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/orbitmod/scout/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          candidateId,
          roleName,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invitation");
      }
      const invite: TeamInviteData = await res.json();
      setStatusMessage({
        text: `Invitation successfully sent to candidate! Tracking ID: ${invite.id}.`,
        type: "success",
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: "error" });
    } finally {
      setInvitingSlotId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900">{team.name}</h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Scout Pod
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">{team.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRunAllocation}
            disabled={allocating}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {allocating ? "Computing Slots..." : "Run Optimal Slot Allocation"}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Team Slots & Optimal Allocations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {team.slots.map((slot) => {
          const activeMember = team.members.find((m) => m.roleName === slot.roleName);
          const allocatedCandidate = allocation?.assignedSlots.find((s) => s.slotId === slot.slotId);

          return (
            <div
              key={slot.slotId}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-900">{slot.roleName}</span>
                  {activeMember ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      FILLED
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      OPEN
                    </span>
                  )}
                </div>

                <div className="text-xs text-neutral-500 mb-3">
                  Required: {slot.requiredSkills.join(", ")}
                </div>

                {activeMember ? (
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                    <div className="font-semibold text-neutral-800">{activeMember.candidateName}</div>
                    <div className="text-[11px] text-neutral-500">Joined: {new Date(activeMember.joinedAt).toLocaleDateString()}</div>
                  </div>
                ) : allocatedCandidate ? (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-900">{allocatedCandidate.candidateName}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-sm">
                        {allocatedCandidate.fitScore}% Fit
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800">
                      Optimal match based on verified skills, timezone overlap, and target hours.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleSendInvite(allocatedCandidate.candidateId, slot.roleName, slot.slotId)}
                      disabled={invitingSlotId === slot.slotId}
                      className="w-full text-xs h-7 mt-1 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      {invitingSlotId === slot.slotId ? "Sending..." : "Send Pod Invitation"}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-neutral-50 border border-dashed border-neutral-300 text-center text-xs text-neutral-500">
                    Slot currently vacant. Run allocation above to identify best candidate matches.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Allocation Summary Card */}
      {allocation && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-xs text-neutral-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-neutral-900">
            <Shield className="w-4 h-4 text-blue-600" />
            Deterministic Bipartite Matching Invariant
          </div>
          <p>
            Candidates are allocated greedily to maximize aggregate team coverage without duplication.
            Each candidate is guaranteed at most one active slot assignment in this pod.
          </p>
        </div>
      )}
    </div>
  );
}
