import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { ProfileEditForm } from "@/components/profiles/profile-edit-form";
import { ExperienceSection } from "@/components/profiles/experience-section";
import { EducationSection } from "@/components/profiles/education-section";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireAuth();

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id! },
    include: {
      skills: { include: { skill: true } },
      education: { orderBy: { startYear: "asc" } },
      experience: { orderBy: { startYear: "asc" } },
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your profile and account preferences.</p>
      </div>

      <div className="space-y-8">
        <ProfileEditForm
          userId={user.id!}
          userName={user.name!}
          userEmail={user.email!}
          profile={profile as any}
        />

        <ExperienceSection
          userId={user.id!}
          initialItems={profile?.experience || []}
        />

        <EducationSection
          userId={user.id!}
          initialItems={profile?.education || []}
        />
      </div>
    </div>
  );
}
