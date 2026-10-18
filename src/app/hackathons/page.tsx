import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { FeaturePanel } from "@/components/ui/feature-panel";
import { HackathonCard } from "@/components/ui/orbit-cards";
import { Trophy, Users, Plus, Compass, Sparkles, Calendar } from "lucide-react";
import { getDotAvatar } from "@/lib/avatars";

export const metadata: Metadata = {
  title: "Hackathons",
  description: "Form teams, compete, and submit verified hackathon projects on Orbit.",
};

export default async function HackathonsPage() {
  const user = await getCurrentUser();

  let teams: any[] = [];
  try {
    teams = await prisma.hackathonTeam.findMany({
      where: { isOpen: true },
      include: {
        members: {
          include: { user: { select: { name: true, image: true } } },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
  } catch {
    // Database fallback
  }

  return (
    <div className="atmos-hackathons min-h-screen">
      <OrbitHeader
        title="Hackathons"
        actions={
          <Link
            href="/hackathons/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED] transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Team</span>
          </Link>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-10 max-w-[1240px] mx-auto w-full">
        {/* Large Editorial Intro */}
        <PageIntro
          eyebrow="Competitive Systems & Builds"
          title="Build. Ship. Prove."
          description="Form complement-driven teams, compete in scoped hackathons, and publish peer-reviewed deliverable submissions."
        />

        {/* Hackathon Spotlight FeaturePanel */}
        <FeaturePanel
          theme="dark"
          eyebrow="Flagship Event"
          badge="₹1,75,000 Prize Pool"
          title="Orbit India Buildathon 2026"
          description="48 hours of competitive systems architecture. Form a complement-driven team with Scout, submit code artifacts, and receive permanent proof-of-work credentials."
          primaryAction={{
            label: "Explore Challenge Tracks",
            href: "/events",
          }}
          secondaryAction={{
            label: "Assemble Team with Scout",
            href: "/dots/scout",
          }}
          visualContent={
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="flex items-center gap-1.5 text-white font-semibold">
                  <Trophy className="h-4 w-4 text-[#FF9500]" /> Global Grand Prix
                </span>
                <span className="text-[#34C759]">Nov 18 - 20</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Tracks: Distributed Systems, Zero-Knowledge Proofs, Developer Telemetry, and Verifiable Coworker Dots.
              </p>
            </div>
          }
        />

        {/* Hackathon Teams Section */}
        <section className="space-y-4 pt-4 border-t border-[#E5E5EA]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
                Open Hackathon Teams
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Join a registered team or recruit complementary contributors
              </p>
            </div>
            <Link
              href="/dots/scout"
              className="text-xs font-medium text-[#0071E3] hover:underline flex items-center gap-1.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDotAvatar("scout")}
                alt="Scout"
                className="h-3.5 w-3.5 rounded-full object-cover"
              />
              <span>Scout Team Matcher</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(teams.length > 0 ? teams : [1, 2, 3]).map((t: any, idx) => (
              <Link
                key={typeof t === "object" ? t.id : idx}
                href={typeof t === "object" ? `/hackathons/${t.id}` : "/hackathons"}
                className="group block rounded-2xl border border-[#E5E5EA] bg-white p-5 hover:border-[#D1D1D6] hover:shadow-card-hover transition-all"
              >
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-[#34C759]/10 text-[#1D7F3E] border border-[#34C759]/20">
                        Recruiting
                      </span>
                      <span className="text-xs text-[#86868B] flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {typeof t === "object" ? (t._count?.members || 1) : 3} members
                      </span>
                    </div>

                    <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors">
                      {typeof t === "object" ? t.name : idx === 0 ? "Team ZeroSync" : idx === 1 ? "Quantum State Labs" : "Decentralized Auth Core"}
                    </h3>

                    <p className="text-[13px] text-[#6E6E73] mt-1.5 line-clamp-2 leading-relaxed">
                      {typeof t === "object" ? (t.description || "Building for the systems track.") : "Assembling a balanced team of systems engineers and UI architects."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0F0F2] flex items-center justify-between text-xs text-[#0071E3] font-medium">
                    <span>Inspect Team Roster</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
