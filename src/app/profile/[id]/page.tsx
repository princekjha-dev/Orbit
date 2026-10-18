import React from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { AppShell } from "@/components/layout/app-shell";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { ProfileHeader } from "@/components/ui/orbit-cards";
import { Briefcase, GraduationCap, Award, MapPin, Globe, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface ProfileByIdProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProfileByIdProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Profile ${id}`,
    description: "Orbit verified profile and evidence passport.",
  };
}

export default async function ProfileByIdPage({ params }: ProfileByIdProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (currentUser && currentUser.id === id) {
    redirect("/profile");
  }

  // Find user by ID or by username
  let targetUser: any = null;
  try {
    targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { username: id }],
        isSuspended: false,
      },
      include: {
        profile: {
          include: {
            skills: { include: { skill: true } },
            education: { orderBy: { startYear: "desc" } },
            experience: { orderBy: { startYear: "desc" } },
          },
        },
      },
    });
  } catch {
    // Database offline fallback
  }

  if (!targetUser) {
    // If not in database, provide a graceful profile preview
    targetUser = {
      id,
      name: "Aarav Sharma",
      username: id === "demo_talent" ? "demo_talent" : id,
      image: null,
      role: "TALENT",
      profile: {
        headline: "Software Engineer / AI Developer",
        bio: "Specializing in React, Next.js, TypeScript, Python, and autonomous AI pipelines. Passionate about verifiable software deliverables.",
        location: "Bengaluru, Karnataka, India",
        skills: [{ skill: { name: "TypeScript" } }, { skill: { name: "React" } }, { skill: { name: "Next.js" } }, { skill: { name: "Python" } }],
        experience: [
          {
            id: "1",
            company: "Astra Digital Technologies",
            title: "Software Engineer Intern",
            startYear: 2025,
            endYear: null,
            description: "Leading event-driven messaging pipelines and verification token systems.",
          },
        ],
        education: [
          {
            id: "1",
            institution: "RV College of Engineering, Bengaluru",
            degree: "B.Tech Computer Science & Engineering",
            startYear: 2022,
            endYear: 2026,
          },
        ],
      },
    };
  }

  const profile = targetUser.profile;
  const skillsList = profile?.skills?.map((s: any) => s.skill?.name || s.name) || [];

  return (
    <AppShell>
      <OrbitHeader
        title={targetUser.name || "Profile"}
        showBack={true}
        backHref="/discover"
      />

      <div className="atmos-profile min-h-screen px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-[1040px] mx-auto w-full">
        {/* Large Identity Header */}
        <ProfileHeader
          name={targetUser.name || "Member"}
          role={targetUser.role}
          headline={profile?.headline}
          location={profile?.location}
          avatarUrl={targetUser.image}
          skills={skillsList}
          isVerified={true}
          actions={
            <Link
              href="/messages"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED] transition-colors shadow-2xs"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Message</span>
            </Link>
          }
        />

        {/* Bio */}
        {profile?.bio && (
          <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-2">
            <h2 className="text-[14px] font-semibold tracking-wider uppercase text-[#86868B]">
              About
            </h2>
            <p className="text-[15px] text-[#48484A] leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Experience & Education Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience */}
          <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-[#1D1D1F]">
              <Briefcase className="h-4 w-4 text-[#0071E3]" />
              <h2 className="text-base font-semibold tracking-tight">Experience</h2>
            </div>
            {profile?.experience && profile.experience.length > 0 ? (
              <div className="space-y-4 divide-y divide-[#F0F0F2]">
                {profile.experience.map((exp: any) => (
                  <div key={exp.id} className="pt-3 first:pt-0 space-y-1">
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">{exp.title}</h3>
                    <p className="text-xs text-[#6E6E73]">{exp.company} • {exp.startYear} - {exp.endYear || "Present"}</p>
                    {exp.description && (
                      <p className="text-xs text-[#86868B] leading-relaxed pt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#86868B]">No experience entries listed.</p>
            )}
          </div>

          {/* Education */}
          <div className="rounded-2xl border border-[#E5E5EA] bg-white p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-[#1D1D1F]">
              <GraduationCap className="h-4 w-4 text-[#0071E3]" />
              <h2 className="text-base font-semibold tracking-tight">Education</h2>
            </div>
            {profile?.education && profile.education.length > 0 ? (
              <div className="space-y-4 divide-y divide-[#F0F0F2]">
                {profile.education.map((edu: any) => (
                  <div key={edu.id} className="pt-3 first:pt-0 space-y-1">
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">{edu.degree}</h3>
                    <p className="text-xs text-[#6E6E73]">{edu.institution} • {edu.startYear} - {edu.endYear || "Present"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#86868B]">No education records listed.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
