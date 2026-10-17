"use client";

import { logout } from "@/lib/auth/logout";
import { LogOut } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => logout("/login")}
      className={
        className ||
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors w-full text-left"
      }
    >
      <LogOut className="h-3.5 w-3.5 text-neutral-400" />
      <span>Sign out</span>
    </button>
  );
}
