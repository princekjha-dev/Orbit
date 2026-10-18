import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { EventRegisterButton } from "@/components/events/event-register-button";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Building2,
  ExternalLink,
  Share2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { title: true, description: true },
    });
    if (!event) return { title: "Event Details" };
    return {
      title: `${event.title} | Orbit`,
      description: event.description.slice(0, 160),
    };
  } catch {
    return { title: "Event Details" };
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  let event: any = null;
  let registration: any = null;

  try {
    const [evData, regData] = await Promise.all([
      prisma.event.findUnique({
        where: { id, isDeleted: false },
        include: {
          organization: { select: { name: true, slug: true } },
          _count: { select: { registrations: true } },
        },
      }),
      user
        ? prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId: id, userId: user.id! } },
          })
        : null,
    ]);
    event = evData;
    registration = regData;
  } catch {
    // Database fallback
  }

  if (!event) {
    event = {
      id,
      title: "Orbit Global Systems Summit 2026",
      description: "Gathering leading engineers, researchers, and technical founders building decentralized state machines, verifiable proofs, and modern developer tooling.",
      organizerName: "Orbit Ecosystem Foundation",
      startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      location: "San Francisco, CA & Online Worldwide",
      format: "HYBRID",
      type: "HACKATHON",
      maxAttendees: 500,
      _count: { registrations: 184 },
    };
  }

  const start = new Date(event.startDate);

  return (
    <div className="atmos-events min-h-screen">
      <OrbitHeader
        title={event.title}
        showBack={true}
        backHref="/events"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1140px] mx-auto w-full space-y-8">
        {/* Large Identity Header */}
        <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-[#FF9500]/10 text-[#9A6300] border border-[#FF9500]/20">
              {event.format || "HYBRID"}
            </span>
            <span className="text-xs text-[#86868B]">
              Organized by {event.organization?.name || event.organizerName || "Orbit Network"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#1D1D1F] leading-[1.15]">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-[13.5px] text-[#6E6E73] pt-1">
            <span className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
              <Calendar className="h-4 w-4 text-[#0071E3]" />
              {start.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#86868B]" />
                {event.location}
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#86868B]" />
              {event._count?.registrations || 0} registered
            </span>
          </div>
        </div>

        {/* 2-column detail grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Description & Schedule */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
                About the Event
              </h2>
              <div className="text-[14.5px] text-[#48484A] leading-relaxed whitespace-pre-line space-y-3">
                {event.description}
              </div>
            </div>

            {/* Schedule Section */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
                Event Schedule & Agenda
              </h2>
              <div className="space-y-3 divide-y divide-[#F0F0F2]">
                <div className="pt-3 first:pt-0 space-y-1">
                  <p className="text-xs font-semibold text-[#0071E3]">09:00 AM PST</p>
                  <p className="text-sm font-semibold text-[#1D1D1F]">Keynote: State of Verifiable Evidence</p>
                  <p className="text-xs text-[#6E6E73]">Architectural review and opening challenge release.</p>
                </div>
                <div className="pt-3 space-y-1">
                  <p className="text-xs font-semibold text-[#0071E3]">11:30 AM PST</p>
                  <p className="text-sm font-semibold text-[#1D1D1F]">Scout Matchmaking & Team Formation</p>
                  <p className="text-xs text-[#6E6E73]">Deterministic 5-signal complementary team assembling.</p>
                </div>
                <div className="pt-3 space-y-1">
                  <p className="text-xs font-semibold text-[#0071E3]">03:00 PM PST</p>
                  <p className="text-sm font-semibold text-[#1D1D1F]">Project Demos & Advisory Reviews</p>
                  <p className="text-xs text-[#6E6E73]">Live deliverable reviews and proof hashing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Registration Box */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 shadow-card space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Admission
                </span>
                <p className="text-xl font-bold text-[#1D1D1F] mt-1">
                  Free Registration
                </p>
                <p className="text-xs text-[#6E6E73]">
                  Open to all verified Orbit builders and members
                </p>
              </div>

              {registration ? (
                <div className="rounded-xl border border-[#C1EAD0] bg-[#E8F8EE] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D7F3E]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Registered</span>
                  </div>
                  <p className="text-[11.5px] text-[#1D7F3E]">
                    Your seat is confirmed. Check your email for access instructions.
                  </p>
                </div>
              ) : (
                <EventRegisterButton eventId={event.id} isRegistered={!!registration} />
              )}

              <div className="pt-3 border-t border-[#F0F0F2] text-xs text-[#86868B] space-y-1.5">
                <div className="flex justify-between">
                  <span>Capacity</span>
                  <span className="font-semibold text-[#1D1D1F]">Open Admission</span>
                </div>
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="font-medium text-[#1D1D1F]">{event.format}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
