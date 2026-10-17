"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function JoinTeamButton({ teamId }: { teamId: string }) {
  const [joined, setJoined] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const join = () => {
    startTransition(async () => {
      const res = await fetch(`/api/hackathons/teams/${teamId}/join`, { method: "POST" });
      if (res.ok) {
        setJoined(true);
        router.refresh();
      }
    });
  };

  return (
    <Button
      variant={joined ? "secondary" : "primary"}
      size="sm"
      onClick={join}
      disabled={isPending || joined}
      aria-live="polite"
    >
      {joined ? (
        <><Check className="h-4 w-4" aria-hidden="true" /> Joined</>
      ) : (
        <><UserPlus className="h-4 w-4" aria-hidden="true" /> Join team</>
      )}
    </Button>
  );
}
