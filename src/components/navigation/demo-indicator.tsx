"use client";

import { isDemoEmail, getDemoAccountByEmail } from "@/lib/auth/roles";
import { DemoAccountSwitcher } from "@/components/auth/demo-account-switcher";
import { useState } from "react";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";

interface DemoIndicatorProps {
  email?: string | null;
  orbitRole?: string;
}

export function DemoIndicator({ email, orbitRole }: DemoIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const demoAccount = getDemoAccountByEmail(email);

  if (!demoAccount && !isDemoEmail(email)) {
    return null;
  }

  return (
    <div className="mx-3 my-2 border border-neutral-200 bg-neutral-50/80 rounded-lg p-2.5 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 text-neutral-800">
            Demo Mode
          </span>
          <span className="font-medium text-neutral-700 truncate text-[11px]">
            {demoAccount?.badge || orbitRole}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-neutral-500 hover:text-neutral-800 p-0.5 rounded transition-colors"
          title="Switch Demo Role"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2 border-t border-neutral-200">
          <DemoAccountSwitcher compact />
        </div>
      )}
    </div>
  );
}
