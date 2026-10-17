import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Globe, MapPin, GraduationCap, Briefcase, Link as LinkIcon, Edit, CheckCircle } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await requireAuth();

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id! },
    include: {
      skills: { include: { skill: true } },
      education: { orderBy: { startYear: "desc" } },
      experience: { orderBy: { startYear: "desc" } },
    },
  });

  const verifiedWork = await prisma.verifiedWorkRecord.findMany({
    where: { userId: user.id! },
    orderBy: { completionDate: "desc" },
    take: 5,
  });

  if (!profile) redirect("/settings");

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">My profile</h1>
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" aria-hidden="true" />
            Edit profile
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col items-center text-center">
              <Avatar src={profile.avatarUrl || user.image} name={user.name!} size="xl" className="mb-4" />
              <h2 className="text-lg font-bold text-neutral-900">{user.name}</h2>
              {profile.headline && (
                <p className="text-sm text-neutral-600 mt-1">{profile.headline}</p>
              )}
              {profile.location && (
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {profile.location}
                </p>
              )}
              {(profile.college || profile.company) && (
                <p className="text-xs text-neutral-500 mt-1">
                  {profile.college || profile.company}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900">
                  <GithubIcon className="h-3.5 w-3.5" />GitHub
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900">
                  <LinkedinIcon className="h-3.5 w-3.5" />LinkedIn
                </a>
              )}
              {profile.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900">
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />Portfolio
                </a>
              )}
            </div>
          </Card>

          {profile.skills.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <Badge key={s.skillId} variant="neutral">{s.skill.name}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {profile.about && (
            <Card>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">About</h3>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
            </Card>
          )}

          {/* Verified Work */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                Verified work
              </h3>
              <span className="text-xs text-neutral-500">Publicly inspectable</span>
            </div>
            {verifiedWork.length === 0 ? (
              <EmptyState
                title="No verified work yet"
                description="Complete a scoped project to earn your first verified work record"
                className="py-8"
              />
            ) : (
              <div className="space-y-4">
                {verifiedWork.map((w) => (
                  <div key={w.id} className="border border-neutral-100 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{w.projectTitle}</p>
                        <p className="text-xs text-neutral-500">{w.orgName} · {w.userRole}</p>
                      </div>
                      <p className="text-xs text-neutral-400 flex-shrink-0">{formatDate(w.completionDate)}</p>
                    </div>
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{w.scope}</p>
                    {w.reviewText && (
                      <p className="text-xs text-neutral-500 mt-2 italic">"{w.reviewText}"</p>
                    )}
                    {w.deliverableUrl && (
                      <a href={w.deliverableUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:underline">
                        <LinkIcon className="h-3 w-3" aria-hidden="true" />
                        View deliverable
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Experience */}
          {profile.experience.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                Experience
              </h3>
              <div className="space-y-4">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-neutral-500">
                      {exp.company[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">{exp.title}</p>
                      <p className="text-xs text-neutral-500">{exp.company}</p>
                      <p className="text-xs text-neutral-400">
                        {exp.startMonth}/{exp.startYear} – {exp.current ? "Present" : `${exp.endMonth}/${exp.endYear}`}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education */}
          {profile.education.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                Education
              </h3>
              <div className="space-y-4">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-neutral-500">
                      {edu.institution[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">{edu.institution}</p>
                      {edu.degree && <p className="text-xs text-neutral-500">{edu.degree}{edu.field && `, ${edu.field}`}</p>}
                      <p className="text-xs text-neutral-400">
                        {edu.startYear} – {edu.current ? "Present" : edu.endYear || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
