import { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { GrowthDashboard } from "@/components/growth/growth-dashboard";
import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Personal Track Record & Growth | Orbit",
  description: "A private view of your verified work, completed projects, practiced skills, and ecosystem achievements.",
};

export default async function GrowthPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/growth");
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <GrowthDashboard />
      </div>
    </AppShell>
  );
}
