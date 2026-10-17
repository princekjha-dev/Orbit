import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  ExternalLink,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Award,
  Globe,
  Lock,
  ArrowRight,
  Code,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { portfolio: { slug: username } }],
    },
    select: { name: true, profile: { select: { headline: true } } },
  });

  if (!targetUser) {
    return { title: "Portfolio | Orbit" };
  }

  return {
    title: `${targetUser.name} | Evidence Portfolio | Orbit`,
    description: targetUser.profile?.headline || `Professional evidence portfolio of ${targetUser.name}`,
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const currentUser = await getCurrentUser();

  // Find user by username or portfolio slug
  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { portfolio: { slug: username } }],
    },
    include: {
      profile: {
        include: {
          skills: { include: { skill: true } },
          education: { orderBy: { startYear: "desc" } },
          experience: { orderBy: { startYear: "desc" } },
        },
      },
      portfolio: true,
      verifiedWorkRecords: {
        orderBy: { completionDate: "desc" },
      },
      outcomeRecords: {
        where: { isPublic: true },
        orderBy: { date: "desc" },
      },
      skillEvidences: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!targetUser) {
    notFound();
  }

  const isOwner = currentUser?.id === targetUser.id;
  const isPrivate = targetUser.portfolio ? !targetUser.portfolio.isPublic : false;

  if (isPrivate && !isOwner && (currentUser as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-500">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Private Portfolio</h1>
          <p className="text-sm text-neutral-600 mb-6">
            This talent portfolio is currently set to private.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Orbit
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Aggregate Skill Evidence with concrete evidence counts
  const skillEvidenceMap: Record<
    string,
    {
      skillName: string;
      verifiedProjectsCount: number;
      externalReposCount: number;
      certificationsCount: number;
      otherEvidenceCount: number;
      evidences: typeof targetUser.skillEvidences;
    }
  > = {};

  // Initialize with profile skills
  for (const ps of targetUser.profile?.skills || []) {
    skillEvidenceMap[ps.skill.name] = {
      skillName: ps.skill.name,
      verifiedProjectsCount: 0,
      externalReposCount: 0,
      certificationsCount: 0,
      otherEvidenceCount: 0,
      evidences: [],
    };
  }

  // Populate evidences
  for (const item of targetUser.skillEvidences) {
    if (!skillEvidenceMap[item.skillName]) {
      skillEvidenceMap[item.skillName] = {
        skillName: item.skillName,
        verifiedProjectsCount: 0,
        externalReposCount: 0,
        certificationsCount: 0,
        otherEvidenceCount: 0,
        evidences: [],
      };
    }
    skillEvidenceMap[item.skillName].evidences.push(item);
    if (item.proofType === "VERIFIED_PROJECT" || item.proofType === "VERIFIED_WORK") {
      skillEvidenceMap[item.skillName].verifiedProjectsCount++;
    } else if (item.proofType === "GITHUB_REPO") {
      skillEvidenceMap[item.skillName].externalReposCount++;
    } else if (item.proofType === "CERTIFICATION") {
      skillEvidenceMap[item.skillName].certificationsCount++;
    } else {
      skillEvidenceMap[item.skillName].otherEvidenceCount++;
    }
  }

  const skillsList = Object.values(skillEvidenceMap);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Brand bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-neutral-900 hover:text-brand-600 transition-colors"
          >
            Orbit
          </Link>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link href="/portfolio/builder">
                <Button size="sm" variant="outline">
                  Edit Portfolio
                </Button>
              </Link>
            )}
            <Badge variant="neutral">
              Evidence Portfolio
            </Badge>
          </div>
        </div>

        {/* Profile Hero Card */}
        <Card className="p-6 sm:p-8 bg-white border-neutral-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                {targetUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {targetUser.name}
                  </h1>
                  {targetUser.verifiedWorkRecords.length > 0 && (
                    <Badge variant="green">
                      <ShieldCheck className="h-3 w-3 mr-1 inline" />
                      Verified Contributor
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-600 mt-1">
                  {targetUser.portfolio?.title || targetUser.profile?.headline || "Talent & Builder"}
                </p>
                {targetUser.profile?.location && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {targetUser.profile.location}
                  </p>
                )}
              </div>
            </div>

            {/* External Links */}
            <div className="flex flex-wrap items-center gap-2">
              {targetUser.profile?.github && (
                <a
                  href={targetUser.profile.github.startsWith("http") ? targetUser.profile.github : `https://${targetUser.profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  <Code className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
              {targetUser.profile?.linkedin && (
                <a
                  href={targetUser.profile.linkedin.startsWith("http") ? targetUser.profile.linkedin : `https://${targetUser.profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
              {targetUser.profile?.website && (
                <a
                  href={targetUser.profile.website.startsWith("http") ? targetUser.profile.website : `https://${targetUser.profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Bio */}
          {(targetUser.portfolio?.bio || targetUser.profile?.about) && (
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <h2 className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-2">
                About
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {targetUser.portfolio?.bio || targetUser.profile?.about}
              </p>
            </div>
          )}
        </Card>

        {/* Section 1: Verified Work & Project Evidence */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-neutral-600" />
              Verified Work Records
            </h2>
            <span className="text-xs text-neutral-500">
              Supported by verified organization reviews
            </span>
          </div>

          {targetUser.verifiedWorkRecords.length === 0 ? (
            <Card className="p-6 text-center text-sm text-neutral-500 bg-white">
              No verified work records recorded yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {targetUser.verifiedWorkRecords.map((record) => (
                <Card key={record.id} className="p-5 bg-white border-neutral-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900 text-base">
                          {record.projectTitle}
                        </h3>
                        <Badge variant="green">
                          <ShieldCheck className="h-3 w-3 mr-1 inline" />
                          Verified
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {record.orgName} - Role: {record.userRole} - Completed {formatDate(record.completionDate)}
                      </p>
                    </div>
                    {record.deliverableUrl && (
                      <a
                        href={record.deliverableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <span>Deliverable</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-neutral-700 mt-2 mb-3">
                    {record.scope}
                  </p>
                  {record.reviewText && (
                    <div className="p-3 rounded-md bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 italic">
                      &ldquo;{record.reviewText}&rdquo;
                      {record.reviewerName && <span className="not-italic text-neutral-500 ml-1">- {record.reviewerName}</span>}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Skill Evidence (Fact-Based, No arbitrary percentages) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-neutral-600" />
              Skill Evidence
            </h2>
            <span className="text-xs text-neutral-500">
              Only verified proof and tangible artifacts displayed
            </span>
          </div>

          {skillsList.length === 0 ? (
            <Card className="p-6 text-center text-sm text-neutral-500 bg-white">
              No skills added yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skillsList.map((skill) => {
                const totalProof =
                  skill.verifiedProjectsCount +
                  skill.externalReposCount +
                  skill.certificationsCount +
                  skill.otherEvidenceCount;

                return (
                  <Card key={skill.skillName} className="p-4 bg-white border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-neutral-900 text-sm">
                        {skill.skillName}
                      </span>
                      {skill.verifiedProjectsCount > 0 ? (
                        <Badge variant="green">
                          Verified
                        </Badge>
                      ) : skill.externalReposCount > 0 || skill.certificationsCount > 0 ? (
                        <Badge variant="blue">
                          External Proof
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          Claimed
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-neutral-600 space-y-1">
                      {totalProof === 0 ? (
                        <p className="text-neutral-400 italic">No evidence linked yet</p>
                      ) : (
                        <>
                          {skill.verifiedProjectsCount > 0 && (
                            <p className="text-emerald-700 font-medium">
                              {skill.verifiedProjectsCount} verified project{skill.verifiedProjectsCount > 1 ? "s" : ""}
                            </p>
                          )}
                          {skill.externalReposCount > 0 && (
                            <p className="text-neutral-700">
                              {skill.externalReposCount} public repositor{skill.externalReposCount > 1 ? "ies" : "y"}
                            </p>
                          )}
                          {skill.certificationsCount > 0 && (
                            <p className="text-neutral-700">
                              {skill.certificationsCount} certification{skill.certificationsCount > 1 ? "s" : ""}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 3: Measurable Outcomes */}
        {targetUser.outcomeRecords.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-neutral-600" />
              Outcome History
            </h2>
            <div className="space-y-3">
              {targetUser.outcomeRecords.map((outcome) => (
                <Card key={outcome.id} className="p-4 bg-white border-neutral-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900 text-sm">
                          {outcome.title}
                        </span>
                        <span className="text-xs text-neutral-500">
                          ({outcome.type.replace(/_/g, " ")})
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        {outcome.activity}
                        {outcome.organizationName && ` - ${outcome.organizationName}`}
                      </p>
                    </div>
                    <Link
                      href={`/evidence/${outcome.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline flex-shrink-0"
                    >
                      <span>Inspect Evidence</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-neutral-600" />
              Experience
            </h2>
            {targetUser.profile?.experience.length === 0 ? (
              <p className="text-xs text-neutral-500">No experience records yet.</p>
            ) : (
              <div className="space-y-2">
                {targetUser.profile?.experience.map((exp) => (
                  <Card key={exp.id} className="p-3 bg-white border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-900">{exp.title}</p>
                    <p className="text-xs text-neutral-600">{exp.company} {exp.location && `- ${exp.location}`}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {exp.startYear} - {exp.current ? "Present" : exp.endYear || "N/A"}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Education */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-neutral-600" />
              Education
            </h2>
            {targetUser.profile?.education.length === 0 ? (
              <p className="text-xs text-neutral-500">No education records yet.</p>
            ) : (
              <div className="space-y-2">
                {targetUser.profile?.education.map((edu) => (
                  <Card key={edu.id} className="p-3 bg-white border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-900">{edu.institution}</p>
                    <p className="text-xs text-neutral-600">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {edu.startYear} - {edu.current ? "Present" : edu.endYear || "N/A"}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-neutral-400 pt-8 border-t border-neutral-200">
          Generated via Orbit V3 Evidence System. All verified records are cryptographically attributable.
        </div>
      </div>
    </div>
  );
}
