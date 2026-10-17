"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function EventRegisterButton({
  eventId,
  isRegistered: initialState,
}: {
  eventId: string;
  isRegistered: boolean;
}) {
  const [saved, setSaved] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const prev = saved;
      setSaved(!prev);
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: prev ? "DELETE" : "POST",
      });
      if (!res.ok) setSaved(prev);
    });
  };

  return (
    <Button
      variant={saved ? "secondary" : "primary"}
      className="w-full"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={saved}
    >
      {saved ? (
        <><BookmarkCheck className="h-4 w-4" aria-hidden="true" /> Saved to calendar</>
      ) : (
        <><Bookmark className="h-4 w-4" aria-hidden="true" /> Save event</>
      )}
    </Button>
  );
}
