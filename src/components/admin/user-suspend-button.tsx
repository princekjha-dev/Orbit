"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserSuspendButton({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  const [suspended, setSuspended] = useState(isSuspended);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend: !suspended }),
      });
      if (res.ok) {
        setSuspended((p) => !p);
        router.refresh();
      }
    });
  };

  return (
    <Button
      size="sm"
      variant={suspended ? "outline" : "danger"}
      onClick={toggle}
      disabled={isPending}
    >
      {suspended ? "Unsuspend" : "Suspend"}
    </Button>
  );
}
