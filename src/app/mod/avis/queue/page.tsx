import { getCurrentUser } from "@/lib/auth/helpers";
import { getReviewQueue } from "@/lib/avis/avis-service";
import { ReviewQueueClient } from "@/components/avis/review-queue-client";
import { FileCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Avis Review Queue | Human Determination",
  description: "Human review queue for pending verification documents, appeals, and risk escalations.",
};

export default async function AvisReviewQueuePage() {
  const user = await getCurrentUser();
  const queue = await getReviewQueue();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <Link
            href="/mod/avis"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Avis Console</span>
          </Link>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-brand-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Human Reviewer Determination Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Decisions are audited with mandatory reasoning. Reviewers cannot determine their own affiliation.
          </p>
        </div>
      </div>

      <ReviewQueueClient initialQueue={queue} />
    </div>
  );
}
