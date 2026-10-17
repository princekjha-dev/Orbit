"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface SaveOpportunityButtonProps {
  opportunityId: string;
  isSaved: boolean;
  userId: string;
}

export function SaveOpportunityButton({
  opportunityId,
  isSaved: initialSaved,
  userId,
}: SaveOpportunityButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const prev = saved;
      setSaved(!prev);
      try {
        const res = await fetch(`/api/opportunities/${opportunityId}/save`, {
          method: prev ? "DELETE" : "POST",
        });
        if (!res.ok) setSaved(prev);
      } catch {
        setSaved(prev);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
      aria-label={saved ? "Remove from saved" : "Save opportunity"}
      aria-pressed={saved}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
