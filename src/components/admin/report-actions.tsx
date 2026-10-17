"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ReportActions({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const act = (action: "resolve" | "dismiss") => {
    startTransition(async () => {
      await fetch(`/api/admin/reports/${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button size="sm" variant="outline" onClick={() => act("dismiss")} disabled={isPending}>
        Dismiss
      </Button>
      <Button size="sm" variant="danger" onClick={() => act("resolve")} disabled={isPending}>
        Resolve
      </Button>
    </div>
  );
}
