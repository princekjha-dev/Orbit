import { prisma } from "@/lib/db";
import { getCurrentUser, requireAuth } from "@/lib/auth/helpers";
import Link from "next/link";
import { Users, Plus, GitBranch, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hackathons",
  description: "Find and form hackathon teams on Orbit.",
};

export default async function HackathonsPage() {
  const user = await requireAuth();

  const teams = await prisma.hackathonTeam.findMany({
    where: { isOpen: true },
    include: {
      members: {
        include: { user: { select: { name: true, image: true } } },
      },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const myTeams = await prisma.hackathonMember.findMany({
    where: { userId: user.id! },
    include: {
      team: {
        include: {
          members: { include: { user: { select: { name: true, image: true } } } },
          _count: { select: { members: true } },
        },
      },
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Hackathon teams</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Find a team for your next hackathon or open yours for new members.
          </p>
        </div>
        <Link href="/hackathons/new">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create team
          </Button>
        </Link>
      </div>

      {myTeams.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Your teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTeams.map(({ team }) => (
              <TeamCard key={team.id} team={team as any} isOwn />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-neutral-700 mb-3">Open teams looking for members</h2>
      {teams.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No open teams"
          description="Be the first to create a team and invite others"
          action={
            <Link href="/hackathons/new">
              <Button size="sm">Create team</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team as any} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamCard({ team, isOwn }: { team: any; isOwn?: boolean }) {
  return (
    <Link href={`/hackathons/${team.id}`}>
      <Card hover className="h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{team.name}</p>
            {isOwn && <Badge variant="blue" className="mt-1">Your team</Badge>}
          </div>
          {team.isOpen && <Badge variant="green">Open</Badge>}
        </div>

        {team.projectIdea && (
          <p className="text-xs text-neutral-600 line-clamp-2 mb-3">{team.projectIdea}</p>
        )}

        {team.rolesNeeded && (
          <p className="text-xs text-neutral-500 mb-3">
            <span className="font-medium text-neutral-700">Looking for:</span> {team.rolesNeeded}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-neutral-100">
          <div className="flex -space-x-1.5">
            {team.members.slice(0, 4).map((m: any) => (
              <Avatar key={m.userId} src={m.user.image} name={m.user.name} size="xs" className="ring-2 ring-white" />
            ))}
          </div>
          <p className="text-xs text-neutral-500">
            {team._count.members} member{team._count.members !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-1.5 ml-auto">
            {team.githubUrl && <GitBranch className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />}
            {team.demoUrl && <Globe className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />}
          </div>
        </div>
      </Card>
    </Link>
  );
}
