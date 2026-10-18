import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { CommunitiesExplorer } from "@/components/communities/communities-explorer";
import { Globe, Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Spaces | OrbitMod V5",
  description: "Public and private topic-focused Spaces for discussions, opportunity posts, and community notes.",
};

export default async function OrbitModSpacesPage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Spaces & Topic Channels
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Community discussion channels where opportunities, talent matching, and evidence-backed discussions take place.
          </p>
        </div>

        <Link
          href="/communities/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Space</span>
        </Link>
      </div>

      <CommunitiesExplorer currentUserId={user?.id} />
    </div>
  );
}
