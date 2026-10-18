import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { JoinTeamButton } from "@/components/hackathons/join-team-button";
import { Avatar } from "@/components/ui/avatar";
import {
  Trophy,
  Users,
  GitBranch,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const team = await prisma.hackathonTeam.findUnique({
      where: { id },
      select: { name: true, description: true },
    });
    if (!team) return { title: "Hackathon Team" };
    return {
      title: `${team.name} | Hackathons`,
      description: team.description?.slice(0, 160),
    };
  } catch {
    return { title: "Hackathon Team" };
  }
}

export default async function HackathonTeamPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  let team: any = null;
  try {
    team = await prisma.hackathonTeam.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true, username: true } } },
        },
        submissions: { orderBy: { submittedAt: "desc" }, take: 1 },
      },
    });
  } catch {
    // Database offline
  }

  if (!team) {
    team = {
      id,
      name: "Team ZeroSync",
      description: "Building an event-driven CRDT state machine with verifiable hash anchors for hackathon submission.",
      rolesNeeded: "Systems Engineer, UI/UX Designer, QA Lead",
      isOpen: true,
      members: [
        {
          id: "m-1",
          role: "OWNER",
          user: { id: "u-1", name: "Alex Rivera", username: "alexr" },
        },
        {
          id: "m-2",
          role: "MEMBER",
          user: { id: "u-2", name: "Elena Rostova", username: "elena" },
        },
      ],
      submissions: [],
    };
  }

  const membership = user ? team.members.find((m: any) => m.userId === user.id) : null;
  const isMember = !!membership;

  return (
    <div className="atmos-hackathons min-h-screen">
      <OrbitHeader
        title={team.name}
        showBack={true}
        backHref="/hackathons"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1140px] mx-auto w-full space-y-8">
        {/* Large Identity Header */}
        <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-[#34C759]/10 text-[#1D7F3E] border border-[#34C759]/20">
              {team.isOpen ? "Open for Teammates" : "Roster Full"}
            </span>
            <span className="text-xs text-[#86868B]">
              Orbit Global Systems Hackathon
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#1D1D1F] leading-[1.15]">
            {team.name}
          </h1>

          <p className="text-[15px] sm:text-[16px] text-[#6E6E73] max-w-2xl leading-relaxed">
            {team.description || "Active competitive hackathon team."}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[#6E6E73] pt-1">
            <span className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
              <Users className="h-4 w-4 text-[#0071E3]" />
              {team.members.length} Confirmed Members
            </span>
            {team.rolesNeeded && (
              <span>Seeking: <strong className="text-[#1D1D1F]">{team.rolesNeeded}</strong></span>
            )}
          </div>
        </div>

        {/* 2-Column Grid: Roster & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main: Members Roster & Submissions */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Team Roster
              </h2>
              <div className="space-y-3 divide-y divide-[#F0F0F2]">
                {team.members.map((m: any) => (
                  <div key={m.id} className="pt-3 first:pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={m.user?.image}
                        name={m.user?.name || "Member"}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#1D1D1F]">
                          {m.user?.name || "Member"}
                        </p>
                        <p className="text-xs text-[#86868B]">{m.role}</p>
                      </div>
                    </div>
                    {m.user?.username && (
                      <Link
                        href={`/u/${m.user.username}`}
                        className="text-xs text-[#0071E3] hover:underline"
                      >
                        View profile →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Section */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-base font-semibold text-[#1D1D1F] flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#FF9500]" />
                <span>Project Submission & Deliverable</span>
              </h2>

              {team.submissions && team.submissions.length > 0 ? (
                <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-1">
                  <p className="text-xs font-semibold text-[#1D1D1F]">
                    Submission Recorded
                  </p>
                  <p className="text-xs text-[#6E6E73]">
                    {team.submissions[0].title || "Hackathon deliverable"}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  Submissions open 12 hours prior to code freeze. Verified deliverables generate cryptographic proof records.
                </p>
              )}
            </div>
          </div>

          {/* Right Action Panel */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 shadow-card space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Join Roster
                </span>
                <p className="text-lg font-bold text-[#1D1D1F] mt-1">
                  {team.isOpen ? "Applications Accepted" : "Roster Full"}
                </p>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  Complementary skills prioritized by Scout
                </p>
              </div>

              {!isMember && team.isOpen && (
                <JoinTeamButton teamId={team.id} />
              )}

              {isMember && (
                <div className="rounded-xl border border-[#C1EAD0] bg-[#E8F8EE] p-3 text-xs text-[#1D7F3E] font-medium text-center">
                  You are an active member of this team.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
