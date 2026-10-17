import { prisma } from "@/lib/db";
import { getOrganizerMockData } from "@/lib/dashboard/mock-data";
import Link from "next/link";
import {
  Users2,
  Calendar,
  Users,
  MessageSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export async function OrganizerDashboard({ userId }: { userId: string }) {
  let communities: any[] = [];
  let events: any[] = [];
  let hackathons: any[] = [];
  let isDemoOffline = false;

  try {
    const results = await Promise.race([
      Promise.all([
        prisma.community.findMany({
          where: {
            OR: [{ creatorId: userId }, { members: { some: { userId, role: "ADMIN" } } }],
          },
          include: {
            _count: { select: { members: true, posts: true } },
            posts: { orderBy: { createdAt: "desc" }, take: 3 },
          },
          take: 2,
        }),
        prisma.event.findMany({
          where: {
            isDeleted: false,
            startDate: { gte: new Date() },
          },
          include: {
            _count: { select: { registrations: true } },
          },
          orderBy: { startDate: "asc" },
          take: 4,
        }),
        prisma.event.findMany({
          where: {
            type: "HACKATHON",
            isDeleted: false,
          },
          include: {
            _count: { select: { registrations: true } },
          },
          take: 2,
        }),
      ]),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("DB offline")), 1500)
      ),
    ]);

    if (results && (results[0].length > 0 || results[1].length > 0)) {
      [communities, events, hackathons] = results;
    } else {
      isDemoOffline = true;
      const mock = getOrganizerMockData();
      communities = mock.communities;
      events = mock.events;
      hackathons = mock.hackathons;
    }
  } catch {
    isDemoOffline = true;
    const mock = getOrganizerMockData();
    communities = mock.communities;
    events = mock.events;
    hackathons = mock.hackathons;
  }

  const activeCommunity = communities[0] || null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" className="text-[11px] font-semibold bg-neutral-900 text-white">
              Organizer Persona
            </Badge>
            {isDemoOffline && (
              <Badge variant="amber" className="text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200">
                Offline Demo Mode
              </Badge>
            )}
            <span className="text-xs text-neutral-400">Community Ecosystem & Hackathon Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Community & Event Organizer Workspace
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Host builder hackathons, organize ecosystem demo days, moderate developer communities, and track participation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/events/new">
            <Button size="sm" variant="primary" className="text-xs gap-1.5">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
          <Link href="/hackathons">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Award className="h-4 w-4" />
              Manage Hackathon
            </Button>
          </Link>
        </div>
      </div>

      {/* Community Card */}
      {activeCommunity && (
        <Card className="p-5 bg-white border border-neutral-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900">{activeCommunity.name}</h2>
                <Badge variant="neutral" className="text-[10px]">
                  {activeCommunity.category}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                {activeCommunity.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-neutral-600 mt-3 pt-3 border-t border-neutral-100">
                <span>{activeCommunity._count.members} Members</span>
                <span>{activeCommunity._count.posts} Discussions</span>
              </div>
            </div>

            <Link href={`/communities/${activeCommunity.slug}`}>
              <Button size="sm" variant="outline" className="text-xs">
                Community Hub &rarr;
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Community Members",
            value: activeCommunity ? activeCommunity._count.members : 0,
            icon: Users2,
          },
          {
            label: "Upcoming Events",
            value: events.length,
            icon: Calendar,
          },
          {
            label: "Hackathons Active",
            value: hackathons.length,
            icon: Award,
          },
          {
            label: "Announcements Posted",
            value: activeCommunity ? activeCommunity._count.posts : 0,
            icon: MessageSquare,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 bg-white border border-neutral-200 shadow-xs">
              <Icon className="h-4 w-4 text-neutral-400 mb-2" />
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* 2-Column: Events & Community Discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events & Hackathons */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-500" />
              Hosted Events & Hackathons
            </h3>
            <Link href="/events" className="text-xs text-brand-600 font-medium hover:underline">
              View all
            </Link>
          </div>

          {events.length === 0 ? (
            <EmptyState
              title="No events scheduled"
              description="Publish an event or hackathon to bring builders together."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {events.map((ev) => (
                <li key={ev.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-neutral-900">{ev.title}</p>
                    <p className="text-neutral-500 text-[11px] mt-0.5">
                      {ev.format} · {new Date(ev.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="blue" className="text-[10px]">
                    {ev._count.registrations} registered
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Community Announcements */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-neutral-500" />
              Community Announcements
            </h3>
            {activeCommunity && (
              <Link href={`/communities/${activeCommunity.slug}`} className="text-xs text-brand-600 font-medium hover:underline">
                Open guild &rarr;
              </Link>
            )}
          </div>

          {!activeCommunity || activeCommunity.posts.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No community posts published yet.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {activeCommunity.posts.map((post: any) => (
                <li key={post.id} className="p-4 text-xs">
                  <p className="font-semibold text-neutral-900">{post.title}</p>
                  <p className="text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                  <span className="text-[10px] text-neutral-400 mt-2 block">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
