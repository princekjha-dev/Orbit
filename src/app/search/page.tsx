import { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SearchDiscovery } from "@/components/search/search-discovery";
import { getCurrentUser } from "@/lib/auth/helpers";

export const metadata: Metadata = {
  title: "Ecosystem Search & Discovery | Orbit",
  description: "Unified search across people, opportunities, startups, projects, and communities.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <SearchDiscovery initialQuery={params.q || ""} currentUserId={user?.id} />
      </div>
    </AppShell>
  );
}
