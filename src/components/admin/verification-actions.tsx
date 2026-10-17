"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export function VerificationActions({ verificationId, orgId }: { verificationId: string; orgId: string }) {
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  const act = async (action: "approve" | "reject") => {
    setLoading(action);
    const res = await fetch(`/api/admin/verifications/${verificationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminNotes }),
    });
    if (res.ok) router.refresh();
    setLoading(null);
  };

  return (
    <div className="flex flex-col gap-2 min-w-48">
      <Textarea
        placeholder="Admin notes (optional)..."
        rows={2}
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => act("approve")}
          loading={loading === "approve"}
          className="flex-1"
        >
          Verify
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => act("reject")}
          loading={loading === "reject"}
          className="flex-1"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
