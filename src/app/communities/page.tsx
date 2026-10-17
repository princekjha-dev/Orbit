import { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { CommunitiesExplorer } from "@/components/communities/communities-explorer";
import { getCurrentUser } from "@/lib/auth/helpers";

export const metadata: Metadata = {
  title: "Communities | Orbit",
  description: "Join focused communities for builders, founders, and specialists to exchange knowledge and collaborate.",
};

export default async function CommunitiesPage() {
  const user = await getCurrentUser();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <CommunitiesExplorer currentUserId={user?.id} />
      </div>
    </AppShell>
  );
}
