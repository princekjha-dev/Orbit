import React from "react";
import Link from "next/link";
import { getCommunityNotes, getRelayMetrics } from "@/lib/relay/relay-service";
import { CommunityNoteCard } from "@/components/relay/community-note-card";
import { MessageSquare, Shield, AlertTriangle, Users, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Relay - Safe Messaging & Community Notes | OrbitMod V5",
  description: "Decentralized Community Notes, off-platform contact safety protection, and team pod channels.",
};

export default async function RelayHubPage() {
  const metrics = await getRelayMetrics();
  const notes = await getCommunityNotes();

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DOT 4: RELAY
              </span>
              <span className="text-xs text-neutral-400">Community Context & Safe Messaging</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Relay: Community Notes & Platform Safety
            </h1>
            <p className="text-sm text-neutral-300 max-w-2xl">
              Decentralized consensus notes with strictly neutral copy, safe team pod messaging with off-platform contact detection, and transparent report triaging.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/mod/relay/notes">
              <Button className="bg-white text-neutral-900 hover:bg-neutral-100 flex items-center gap-2 font-semibold">
                <Plus className="w-4 h-4 text-amber-600" />
                Write Community Note
              </Button>
            </Link>
            <Link href="/mod/relay/channels/channel-pod-nexus">
              <Button variant="outline" className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Open Nexus Pod Channel
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-800">
          <div>
            <div className="text-2xl font-bold text-white">{metrics.totalNotes}</div>
            <div className="text-xs text-neutral-400">Community Notes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{metrics.helpfulNotesCount}</div>
            <div className="text-xs text-neutral-400">Rated Helpful (&ge;65%)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{metrics.activeChannelsCount}</div>
            <div className="text-xs text-neutral-400">Monitored Pod Channels</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{metrics.safetyInterventionsCount}</div>
            <div className="text-xs text-neutral-400">Safety Interventions</div>
          </div>
        </div>
      </div>

      {/* Community Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Decentralized Community Notes</h2>
            <p className="text-xs text-neutral-500">
              Community context notes rated by independent reviewers. Enforces neutral, objective copy standards.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {notes.map((note) => (
            <CommunityNoteCard key={note.id} note={note} currentUserId="candidate-alex-chen" />
          ))}
        </div>
      </div>
    </div>
  );
}
