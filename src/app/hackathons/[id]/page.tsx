import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitBranch, Globe, Plus, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AppShell } from "@/components/layout/app-shell";
import { JoinTeamButton } from "@/components/hackathons/join-team-button";
import type { Metadata } from "next";

interface PageProps { params: { id: string } }

export const metadata: Metadata = { title: "Hackathon Team" };

export default async function TeamDetailPage({ params }: PageProps) {
  const user = await requireAuth();

  const team = await prisma.hackathonTeam.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true, username: true } } },
      },
      submissions: { orderBy: { submittedAt: "desc" }, take: 1 },
    },
  });

  if (!team) notFound();

  const membership = team.members.find((m) => m.userId === user.id!);
  const isOwner = membership?.role === "OWNER";
  const isMember = !!membership;

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <Link href="/hackathons" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to teams
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">{team.name}</h1>
                  {team.isOpen && <Badge variant="green" className="mt-2">Open to new members</Badge>}
                </div>
                {!isMember && team.isOpen && (
                  <JoinTeamButton teamId={team.id} />
                )}
              </div>

              {team.description && (
                <p className="text-sm text-neutral-700 mt-4 leading-relaxed">{team.description}</p>
              )}

              {team.rolesNeeded && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 mb-1">Roles needed</p>
                  <p className="text-sm text-blue-800">{team.rolesNeeded}</p>
                </div>
              )}

              <div className="flex gap-3 mt-5 pt-5 border-t border-neutral-100">
                {team.githubUrl && (
                  <a href={team.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900">
                    <GitBranch className="h-4 w-4" aria-hidden="true" />GitHub
                  </a>
                )}
                {team.demoUrl && (
                  <a href={team.demoUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900">
                    <Globe className="h-4 w-4" aria-hidden="true" />Live demo
                  </a>
                )}
              </div>
            </Card>

            {team.projectIdea && (
              <Card>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">Project idea</h2>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{team.projectIdea}</p>
              </Card>
            )}

            {/* Submission */}
            {team.submissions[0] && (
              <Card>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">Submission</h2>
                <p className="text-base font-medium text-neutral-900">{team.submissions[0].title}</p>
                <p className="text-sm text-neutral-600 mt-2">{team.submissions[0].description}</p>
                <div className="flex gap-3 mt-4">
                  {team.submissions[0].githubUrl && (
                    <a href={team.submissions[0].githubUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
                      <GitBranch className="h-4 w-4" aria-hidden="true" />GitHub
                    </a>
                  )}
                  {team.submissions[0].demoUrl && (
                    <a href={team.submissions[0].demoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
                      <Globe className="h-4 w-4" aria-hidden="true" />Demo
                    </a>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Members sidebar */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-900">
                  Members ({team.members.length})
                </h2>
              </div>
              <ul className="space-y-3">
                {team.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <Avatar src={m.user.image} name={m.user.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">{m.user.name}</p>
                      <p className="text-xs text-neutral-400">@{m.user.username}</p>
                    </div>
                    {m.role === "OWNER" && (
                      <Badge variant="blue">Owner</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </Card>

            {isMember && !team.submissions[0] && (
              <Link href={`/hackathons/${team.id}/submit`}>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Submit project
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
