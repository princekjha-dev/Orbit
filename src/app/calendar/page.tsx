import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { UnifiedCalendar } from "@/components/calendar/unified-calendar";
import { getCurrentUser } from "@/lib/auth/helpers";

export const metadata: Metadata = {
  title: "Calendar & Schedule | Orbit",
  description: "Keep deadlines, interviews, events, advisory sessions, and milestones in one unified view.",
};

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/calendar");
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <UnifiedCalendar />
      </div>
    </AppShell>
  );
}
