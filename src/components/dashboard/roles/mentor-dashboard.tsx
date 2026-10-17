import { prisma } from "@/lib/db";
import { getMentorMockData } from "@/lib/dashboard/mock-data";
import Link from "next/link";
import {
  Compass,
  Calendar,
  Users2,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export async function MentorDashboard({ userId }: { userId: string }) {
  let profile: any = null;
  let sessions: any[] = [];
  let requests: any[] = [];
  let communities: any[] = [];
  let isDemoOffline = false;

  try {
    const results = await Promise.race([
      Promise.all([
        prisma.mentorProfile.findUnique({
          where: { userId },
        }),
        prisma.mentorshipSession.findMany({
          where: { mentorId: userId },
          include: {
            mentee: { select: { id: true, name: true, username: true, email: true } },
            request: { select: { topic: true, goals: true } },
          },
          orderBy: { scheduledAt: "asc" },
          take: 5,
        }),
        prisma.mentorshipRequest.findMany({
          where: { mentorId: userId, status: "REQUESTED" },
          include: {
            mentee: { select: { id: true, name: true, username: true, email: true } },
          },
          take: 4,
        }),
        prisma.communityMember.findMany({
          where: { userId },
          include: {
            community: { select: { id: true, name: true, slug: true, category: true } },
          },
          take: 3,
        }),
      ]),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("DB offline")), 1500)
      ),
    ]);

    if (results && (results[0] || results[1].length > 0)) {
      [profile, sessions, requests, communities] = results;
    } else {
      isDemoOffline = true;
      const mock = getMentorMockData();
      profile = mock.profile;
      sessions = mock.sessions;
      requests = mock.requests;
      communities = mock.communities;
    }
  } catch {
    isDemoOffline = true;
    const mock = getMentorMockData();
    profile = mock.profile;
    sessions = mock.sessions;
    requests = mock.requests;
    communities = mock.communities;
  }

  const upcomingSessions = sessions.filter(
    (s: any) => new Date(s.scheduledAt).getTime() >= Date.now() && s.status === "SCHEDULED"
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="green" className="text-[11px] font-semibold">
              Mentor Persona
            </Badge>
            {isDemoOffline && (
              <Badge variant="amber" className="text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200">
                Offline Demo Mode
              </Badge>
            )}
            <span className="text-xs text-neutral-400">Technical Advisor & Startup Guide</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Advisory & Mentorship Hub
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Support builders, review startup architectures, conduct 1:1 advisory sessions, and guide ecosystem projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/action-center">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Clock className="h-4 w-4" />
              Review Requests
            </Button>
          </Link>
          <Link href="/profile">
            <Button size="sm" variant="primary" className="text-xs gap-1.5">
              <Compass className="h-4 w-4" />
              Update Availability
            </Button>
          </Link>
        </div>
      </div>

      {/* Expertise & Availability Banner */}
      {profile && (
        <Card className="p-5 bg-white border border-neutral-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900">
                  Advisory Focus: {profile.expertise}
                </h2>
                {profile.isVerified && (
                  <Badge variant="green" className="text-[10px]">
                    Verified Advisor
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Format: <span className="text-neutral-700 font-medium">{profile.mentoringFormat}</span> · Availability:{" "}
                <span className="text-neutral-700 font-medium">{profile.availability}</span>
              </p>
            </div>
            <Link href="/profile">
              <Button size="sm" variant="outline" className="text-xs">
                Edit Bio & Slots
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Upcoming Sessions",
            value: upcomingSessions.length,
            icon: Calendar,
          },
          {
            label: "Pending Requests",
            value: requests.length,
            icon: Clock,
          },
          {
            label: "Completed Sessions",
            value: sessions.filter((s) => s.status === "COMPLETED").length,
            icon: CheckCircle2,
          },
          {
            label: "Active Communities",
            value: communities.length,
            icon: Users2,
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

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Sessions */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-500" />
              Scheduled Advisory Sessions
            </h3>
            <span className="text-xs text-neutral-400">1:1 Reviews</span>
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              title="No sessions scheduled"
              description="Accepted mentorship requests will appear here with calendar dates."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {sessions.map((sess) => (
                <li key={sess.id} className="p-4 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">
                      {sess.request?.topic || "Advisory Session"}
                    </p>
                    <p className="text-neutral-600 mt-0.5">
                      Mentee: <span className="font-medium text-neutral-900">{sess.mentee.name}</span>
                    </p>
                    <p className="text-neutral-400 text-[11px] mt-1">
                      {new Date(sess.scheduledAt).toLocaleString()} ({sess.durationMinutes} mins)
                    </p>
                  </div>
                  <Badge variant={sess.status === "SCHEDULED" ? "blue" : "neutral"} className="text-[10px]">
                    {sess.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Mentorship Requests Inflow */}
        <Card padding="none" className="overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-500" />
              Pending Mentorship Requests
            </h3>
            <span className="text-xs text-neutral-400">Inbound</span>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No pending requests. All mentorship inquiries have been reviewed.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {requests.map((req) => (
                <li key={req.id} className="p-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-neutral-900">{req.mentee.name}</p>
                    <Badge variant="neutral" className="text-[10px]">Pending</Badge>
                  </div>
                  <p className="text-neutral-700 font-medium">{req.topic}</p>
                  <p className="text-neutral-500 text-[11px] line-clamp-2">{req.goals}</p>
                  <div className="pt-2 flex gap-2">
                    <Button size="sm" variant="primary" className="text-xs h-7 px-3">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
