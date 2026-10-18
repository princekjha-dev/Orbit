"use client";

import React, { useState } from "react";
import { CommunityNote, NoteRatingType } from "@/lib/relay/relay-engine";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ThumbsUp, ThumbsDown, HelpCircle, ExternalLink, MessageSquare } from "lucide-react";

interface CommunityNoteCardProps {
  note: CommunityNote;
  currentUserId?: string;
}

export function CommunityNoteCard({ note: initialNote, currentUserId }: CommunityNoteCardProps) {
  const [note, setNote] = useState<CommunityNote>(initialNote);
  const [rating, setRating] = useState<NoteRatingType | null>(() => {
    const found = initialNote.ratings.find((r) => r.raterId === currentUserId);
    return found ? found.rating : null;
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRate = async (rateVal: NoteRatingType) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/orbitmod/relay/notes/${note.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: rateVal }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit rating");
      }

      const updated = await res.json();
      setNote(updated);
      setRating(rateVal);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (note.status) {
      case "CURRENTLY_RATED_HELPFUL":
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Rated Helpful ({Math.round(note.helpfulnessScore * 100)}%)
          </span>
        );
      case "NEEDS_MORE_RATINGS":
        return (
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Needs More Ratings ({note.ratings.length}/3)
          </span>
        );
      case "CURRENTLY_RATED_NOT_HELPFUL":
        return (
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-300">
            Rated Not Helpful
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Proposed Context
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-bold text-neutral-800">
            Community Note on {note.targetEntityType}: {note.targetEntityId}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Content */}
      <p className="text-xs text-neutral-700 leading-relaxed">{note.content}</p>

      {/* Evidence links */}
      {note.evidenceLinks.length > 0 && (
        <div className="pt-1">
          <div className="text-[11px] font-semibold text-neutral-500 mb-1">Sources & References:</div>
          <div className="flex flex-wrap gap-2">
            {note.evidenceLinks.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline max-w-xs truncate"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">{url}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Rating Bar */}
      <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-[11px] text-neutral-500">
          Did this note provide clear, helpful context?
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={rating === "HELPFUL" ? "primary" : "outline"}
            onClick={() => handleRate("HELPFUL")}
            disabled={submitting}
            className="h-7 text-xs flex items-center gap-1"
          >
            <ThumbsUp className="w-3 h-3" /> Helpful
          </Button>
          <Button
            size="sm"
            variant={rating === "SOMEWHAT_HELPFUL" ? "primary" : "outline"}
            onClick={() => handleRate("SOMEWHAT_HELPFUL")}
            disabled={submitting}
            className="h-7 text-xs"
          >
            Somewhat
          </Button>
          <Button
            size="sm"
            variant={rating === "NOT_HELPFUL" ? "primary" : "outline"}
            onClick={() => handleRate("NOT_HELPFUL")}
            disabled={submitting}
            className="h-7 text-xs flex items-center gap-1"
          >
            <ThumbsDown className="w-3 h-3" /> Not
          </Button>
        </div>
      </div>

      {errorMsg && (
        <p className="text-[11px] text-red-600 font-medium">{errorMsg}</p>
      )}
    </div>
  );
}
