import React from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { AppleSettingsView } from "@/components/settings/apple-settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account, security, notification, and appearance preferences.",
};

export default async function SettingsPage() {
  const user = await requireAuth();

  let profile: any = null;
  try {
    profile = await prisma.profile.findUnique({
      where: { userId: user.id! },
      include: {
        skills: { include: { skill: true } },
        education: { orderBy: { startYear: "asc" } },
        experience: { orderBy: { startYear: "asc" } },
      },
    });
  } catch {
    // Database offline
  }

  return (
    <div className="min-h-screen">
      <OrbitHeader title="Settings" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-[1040px] mx-auto w-full">
        <PageIntro
          eyebrow="Preferences"
          title="Settings"
          description="Manage your account credentials, notification filters, security guardrails, and connected tools."
        />

        <AppleSettingsView user={user} profile={profile} />
      </div>
    </div>
  );
}
