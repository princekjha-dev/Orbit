import { resolveStartup } from "@/lib/startups/service";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import { StartupWorkspaceClient } from "@/components/startups/startup-workspace-client";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const startup = await resolveStartup(slug);
  if (!startup) {
    return { title: "Startup Workspace Not Found — Orbit" };
  }
  return {
    title: `${startup.name} — Workspace · Orbit`,
    description: `Manage sprint deliverables, milestones, and hiring pipeline for ${startup.name}.`,
  };
}

export default async function StartupWorkspacePage({ params }: PageProps) {
  const { slug } = await params;
  const startup = await resolveStartup(slug, { fullWorkspace: true });

  if (!startup) {
    notFound();
  }

  const user = await getCurrentUser();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <StartupWorkspaceClient startup={startup} currentUserId={user?.id} />
    </div>
  );
}
