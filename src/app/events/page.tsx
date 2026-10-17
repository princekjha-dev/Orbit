import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, Users, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover hackathons, workshops, demo days, and tech meetups near you.",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  HACKATHON: "Hackathon",
  STARTUP_EVENT: "Startup Event",
  TECH_MEETUP: "Tech Meetup",
  WORKSHOP: "Workshop",
  CAREER_EVENT: "Career Event",
  DEMO_DAY: "Demo Day",
  ENTREPRENEURSHIP: "Entrepreneurship",
  OTHER: "Other",
};

const EVENT_TYPE_BADGE: Record<string, "blue" | "green" | "amber" | "purple" | "neutral"> = {
  HACKATHON: "blue",
  STARTUP_EVENT: "green",
  TECH_MEETUP: "neutral",
  WORKSHOP: "amber",
  CAREER_EVENT: "blue",
  DEMO_DAY: "purple",
  ENTREPRENEURSHIP: "green",
  OTHER: "neutral",
};

interface PageProps {
  searchParams: { q?: string; type?: string; format?: string; city?: string };
}

export default async function EventsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const role = (user as any)?.role;

  const where: any = {
    isDeleted: false,
    startDate: { gte: new Date() },
  };
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { description: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.type && searchParams.type !== "all") where.type = searchParams.type;
  if (searchParams.format && searchParams.format !== "all") where.format = searchParams.format;
  if (searchParams.city) where.city = { contains: searchParams.city, mode: "insensitive" };

  const [events, savedEventIds] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      take: 50,
    }),
    user
      ? prisma.eventRegistration.findMany({
          where: { userId: user.id! },
          select: { eventId: true },
        })
      : [],
  ]);

  const savedSet = new Set(savedEventIds.map((r) => r.eventId));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Hackathons, workshops, demo days, and meetups.
          </p>
        </div>
        {(role === "FOUNDER" || role === "ADMIN") && (
          <Link href="/events/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add event
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search events..."
            className="w-full pl-4 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Search events"
          />
        </div>
        <select
          name="type"
          defaultValue={searchParams.type || "all"}
          className="border border-neutral-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          name="format"
          defaultValue={searchParams.format || "all"}
          className="border border-neutral-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Filter by format"
        >
          <option value="all">Online + Offline</option>
          <option value="ONLINE">Online only</option>
          <option value="OFFLINE">In-person only</option>
          <option value="HYBRID">Hybrid</option>
        </select>
        <input
          name="city"
          defaultValue={searchParams.city}
          placeholder="City..."
          className="border border-neutral-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 w-32"
          aria-label="Filter by city"
        />
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar />}
          title="No upcoming events"
          description="Check back soon for hackathons, workshops, and meetups in your area"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => {
            const start = new Date(event.startDate);
            const isSaved = savedSet.has(event.id);

            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card hover className="h-full flex flex-col p-0 overflow-hidden">
                  {/* Date header */}
                  <div className="bg-neutral-50 border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white border border-neutral-200 flex flex-col items-center justify-center text-center flex-shrink-0">
                      <p className="text-xs font-bold text-neutral-500 leading-none">
                        {start.toLocaleDateString("en", { month: "short" }).toUpperCase()}
                      </p>
                      <p className="text-lg font-bold text-neutral-900 leading-tight">
                        {start.getDate()}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <Badge variant={EVENT_TYPE_BADGE[event.type] || "neutral"}>
                        {EVENT_TYPE_LABELS[event.type] || event.type}
                      </Badge>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {event.format === "ONLINE" ? "Online" : event.city || "In-person"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-sm font-semibold text-neutral-900 line-clamp-2 mb-1">
                      {event.title}
                    </h2>
                    <p className="text-xs text-neutral-500 mb-2">{event.organizerName}</p>
                    <p className="text-xs text-neutral-600 line-clamp-2 flex-1 mb-3">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>{event.isFree ? "Free" : event.price || "Paid"}</span>
                      {isSaved && (
                        <span className="text-brand-600 font-medium">Saved</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
