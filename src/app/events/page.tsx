import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { EventCard } from "@/components/ui/orbit-cards";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover events, hackathons and gatherings where builders, founders and talent meet.",
};

interface PageProps {
  searchParams?: Promise<{ q?: string; type?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  let events: any[] = [];
  try {
    events = await prisma.event.findMany({
      where: { isDeleted: false },
      include: { organization: { select: { name: true, slug: true } }, _count: { select: { registrations: true } } },
      orderBy: { startDate: "asc" },
      take: 24,
    });
  } catch {
    // Keep the public directory available when the database is offline.
  }

  if (events.length === 0) {
    try {
      const { inMemoryStore } = await import("@/lib/database/in-memory-store");
      if (inMemoryStore?.events && inMemoryStore.events.size > 0) {
        events = Array.from(inMemoryStore.events.values()).filter((e: any) => !e.isDeleted);
      }
    } catch {
      // ignore
    }
  }
  if (params.type) events = events.filter((event) => event.type === params.type);
  if (params.q) {
    const query = params.q.toLowerCase();
    events = events.filter((event) => event.title?.toLowerCase().includes(query) || event.description?.toLowerCase().includes(query));
  }

  return (
    <div className="atmos-events min-h-screen">
      <OrbitHeader title="Events" actions={<Link href="/hackathons" className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#0071E3] hover:underline"><Trophy className="h-3.5 w-3.5" /> Hackathons</Link>} />
      <div className="mx-auto w-full max-w-[1240px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro eyebrow="Gatherings & competitions" title="What's happening next?" description="Discover events, hackathons and gatherings where builders, founders and talent meet." />
        <section className="space-y-4 border-t border-[#E5E5EA] pt-7">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Events and hackathons</h2>
          {events.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => <EventCard key={event.id} id={event.id} title={event.title} organizer={event.organization?.name || "Organizer"} date={new Date(event.startDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })} location={event.location || "Online"} format={event.format} category={event.type?.replaceAll("_", " ")} />)}
            </div>
          ) : (
            <EmptyState icon={<CalendarDays />} title="No events yet" description="New events and hackathons will appear here when organizers publish them." />
          )}
        </section>
      </div>
    </div>
  );
}
