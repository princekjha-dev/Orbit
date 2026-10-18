import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { PageIntro } from "@/components/ui/page-intro";
import { CommunitiesExplorer } from "@/components/communities/communities-explorer";
import { getCurrentUser } from "@/lib/auth/helpers";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Communities",
  description: "Curated technical spaces for builders, founders, and specialists.",
};

export default async function CommunitiesPage() {
  const user = await getCurrentUser();

  return (
    <AppShell>
      <OrbitHeader
        title="Communities"
        actions={
          <Link
            href="/communities/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED] transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Space</span>
          </Link>
        }
      />
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-[1240px] mx-auto w-full">
        <PageIntro
          eyebrow="People with shared interests"
          title="Find your community."
          description="Join communities built around technology, entrepreneurship, design, careers and shared interests."
        />
        <CommunitiesExplorer currentUserId={user?.id} />
      </div>
    </AppShell>
  );
}
