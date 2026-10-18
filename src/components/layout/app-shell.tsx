import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { OrbitSidebar } from "@/components/layout/orbit-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { ORBIT_AVATAR } from "@/lib/avatars";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const activeRole = (user as any)?.orbitRole || (user as any)?.role;

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col antialiased text-[#1D1D1F]">
      {/* Desktop Vertical Sidebar (Strict requirement: 240-280px left sidebar) */}
      <OrbitSidebar user={user} activeRole={activeRole} />

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between px-4 border-b border-[#E5E5EA] bg-[#FFFFFF]/90 backdrop-blur-md">
        <Link href="/home" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[7px] overflow-hidden flex items-center justify-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ORBIT_AVATAR}
              alt="Orbit"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
            Orbit
          </span>
        </Link>
        <MobileNav role={activeRole} user={user} />
      </header>

      {/* Main Content Area — Canvas to the right of the vertical sidebar */}
      <main className="flex-1 lg:pl-[260px] min-h-screen flex flex-col transition-all duration-300">
        <div className="flex-1 w-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
