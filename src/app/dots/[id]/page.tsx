import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/helpers";
import { AppShell } from "@/components/layout/app-shell";
import { OrbitHeader } from "@/components/layout/orbit-header";
import { DotWorkspaceView, DotId } from "@/components/chat/dot-workspace-view";

interface DotPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DotPageProps): Promise<Metadata> {
  const { id } = await params;
  const dotName = id.toUpperCase();
  return {
    title: `${dotName} Workspace`,
    description: `Dedicated workspace for coworker Dot ${dotName}.`,
  };
}

export default async function DotWorkspacePage({ params }: DotPageProps) {
  const { id } = await params;
  const validDots = ["atlas", "scout", "forge", "signal", "avis", "quill", "relay"];
  const dotId = id.toLowerCase();

  if (!validDots.includes(dotId)) {
    notFound();
  }

  const user = await getCurrentUser();

  return (
    <AppShell>
      <OrbitHeader
        title={`${dotId.toUpperCase()} Workspace`}
        showBack={true}
        backHref="/dots"
      />
      <DotWorkspaceView
        dotId={dotId as DotId}
        currentUserId={user?.id || "guest-user"}
        currentUserName={user?.name || "Member"}
      />
    </AppShell>
  );
}
