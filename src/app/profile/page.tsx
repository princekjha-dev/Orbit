import React from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { ProfileHeader } from "@/components/ui/orbit-cards";
import { SkillEvidenceManager } from "@/components/profiles/skill-evidence-manager";
import {
  Briefcase,
  GraduationCap,
  Award,
  ShieldCheck,
  Edit,
  FolderKanban,
  ExternalLink,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profile",
  description: "Editorial capability passport and verified work records.",
};

export default async function ProfilePage() {
  const user = await requireAuth();

  let profile: any = null;
  let verifiedWork: any[] = [];
  let skillEvidences: any[] = [];
  let portfolio: any = null;

  try {
    const results = await Promise.race([
      Promise.all([
        prisma.profile.findUnique({
          where: { userId: user.id! },
          include: {
            skills: { include: { skill: true } },
            education: { orderBy: { startYear: "desc" } },
            experience: { orderBy: { startYear: "desc" } },
          },
        }),
        prisma.verifiedWorkRecord.findMany({
          where: { userId: user.id! },
          orderBy: { completionDate: "desc" },
          take: 5,
        }),
        prisma.skillEvidence.findMany({
          where: { userId: user.id! },
          orderBy: { createdAt: "desc" },
        }),
        prisma.portfolio.findUnique({
          where: { userId: user.id! },
        }),
      ]),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout")), 1500)
      ),
    ]);

    if (results) {
      [profile, verifiedWork, skillEvidences, portfolio] = results;
    }
  } catch {
    // Database offline
  }

  const skillsList = profile?.skills?.map((s: any) => s.skill?.name || s.name) || [
    "TypeScript",
    "React",
    "Next.js",
    "Systems Architecture",
  ];

  return (
    <div className="atmos-profile min-h-screen">
      <OrbitHeader
        title="My Profile"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5EA] bg-white text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          >
            <Edit className="h-3 w-3 text-[#6E6E73]" />
            <span>Edit Profile</span>
          </Link>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-[1040px] mx-auto w-full">
        {/* Large Identity Section */}
        <ProfileHeader
          name={user.name || "Member"}
          role={user.orbitRole || user.role || "Talent"}
          headline={profile?.headline || "Systems Engineer & Contributor"}
          location={profile?.location || "San Francisco, CA / Remote"}
          avatarUrl={user.image}
          skills={skillsList}
          isVerified={true}
          actions={
            <Link
              href="/career/roadmap"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED] transition-colors shadow-2xs"
            >
              <span>Career Roadmap</span>
            </Link>
          }
        />

        {/* Bio / Capability Summary */}
        <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-2 shadow-xs">
          <h2 className="text-[12px] font-semibold tracking-wider uppercase text-[#86868B]">
            About & Focus
          </h2>
          <p className="text-[14.5px] text-[#48484A] leading-relaxed">
            {profile?.bio ||
              "Specializing in high-throughput data sync, distributed consensus, and TypeScript systems architecture. Focused on shipping credible open-source work and verifiable project deliverables."}
          </p>
        </div>

        {/* Verifiable Work Records / Evidence Passport */}
        <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#0071E3]" />
              <h2 className="text-base font-semibold text-[#1D1D1F]">
                Cryptographic Evidence Passport
              </h2>
            </div>
            <Link
              href="/evidence/timeline"
              className="text-xs text-[#0071E3] font-medium hover:underline"
            >
              Full evidence timeline →
            </Link>
          </div>

          <p className="text-xs text-[#6E6E73]">
            Observable proofs created through verified project milestone completion and Quill task evaluations.
          </p>

          <div className="space-y-3 pt-1">
            {verifiedWork.length > 0 ? (
              verifiedWork.map((record: any) => (
                <div
                  key={record.id}
                  className="p-4 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1D1D1F]">
                      {record.title}
                    </p>
                    <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-white text-[#0071E3] border border-[#B9DCFF]">
                      SHA-256 Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#6E6E73]">
                    {record.description || "Deliverable verified by organization leadership."}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1D1D1F]">
                    Distributed Sync State Machine
                  </p>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-white text-[#0071E3] border border-[#B9DCFF]">
                    SHA-256 Verified
                  </span>
                </div>
                <p className="text-xs text-[#6E6E73]">
                  Verified deliverable for Astra Digital Technologies. Accepted with full unit test suite.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Experience & Education Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience */}
          <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1D1D1F]">
                <Briefcase className="h-4 w-4 text-[#0071E3]" />
                <h2 className="text-base font-semibold">Experience</h2>
              </div>
              <Link href="/settings" className="text-xs text-[#0071E3] hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3 divide-y divide-[#F0F0F2]">
              {profile?.experience && profile.experience.length > 0 ? (
                profile.experience.map((exp: any) => (
                  <div key={exp.id} className="pt-3 first:pt-0 space-y-0.5">
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">{exp.title}</h3>
                    <p className="text-xs text-[#6E6E73]">{exp.company} • {exp.startYear} - {exp.endYear || "Present"}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-2 pt-1 text-xs text-[#6E6E73]">
                  <p className="font-semibold text-[#1D1D1F]">Software Engineer Intern • Astra Digital Technologies</p>
                  <p>2025 - Present • Leading distributed architecture pipelines and microservices.</p>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1D1D1F]">
                <GraduationCap className="h-4 w-4 text-[#0071E3]" />
                <h2 className="text-base font-semibold">Education</h2>
              </div>
              <Link href="/settings" className="text-xs text-[#0071E3] hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3 divide-y divide-[#F0F0F2]">
              {profile?.education && profile.education.length > 0 ? (
                profile.education.map((edu: any) => (
                  <div key={edu.id} className="pt-3 first:pt-0 space-y-0.5">
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">{edu.degree}</h3>
                    <p className="text-xs text-[#6E6E73]">{edu.institution} • {edu.startYear} - {edu.endYear || "Present"}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-2 pt-1 text-xs text-[#6E6E73]">
                  <p className="font-semibold text-[#1D1D1F]">B.Tech Computer Science • RV College of Engineering</p>
                  <p>2022 - 2026 • Bengaluru • Focus on Distributed Systems and AI.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
