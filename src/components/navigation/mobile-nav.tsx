"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  role?: string;
  user?: any;
}

export function MobileNav({ role, user }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-modal flex flex-col animate-slide-up"
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
              <span className="text-base font-semibold text-neutral-900">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4" onClick={() => setOpen(false)}>
              <SidebarNav role={role} />
            </div>

            {user && (
              <div className="px-4 py-4 border-t border-neutral-100 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar src={user.image} name={user.name || "User"} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left text-sm text-neutral-600 hover:text-neutral-900 py-2 px-3 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
