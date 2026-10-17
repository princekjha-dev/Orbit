import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { Avatar } from "@/components/ui/avatar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { DemoIndicator } from "@/components/navigation/demo-indicator";
import { SignOutButton } from "@/components/auth/sign-out-button";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const activeRole = (user as any)?.orbitRole || (user as any)?.role;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-neutral-200 bg-white z-30">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
            <span className="text-base font-semibold text-neutral-900 tracking-tight">
              Orbit
            </span>
          </div>
        </div>

        {/* Demo Persona Indicator & Quick Switcher */}
        {user && (
          <DemoIndicator email={user.email} orbitRole={(user as any)?.orbitRole} />
        )}

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <SidebarNav role={activeRole} />
        </div>

        {/* User Card & Logout */}
        {user && (
          <div className="px-3 py-3 border-t border-neutral-100 space-y-1">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Avatar
                src={user.image}
                name={user.name || "User"}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-900 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
              </div>
            </Link>
            <SignOutButton />
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between px-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="text-base font-semibold text-neutral-900 tracking-tight">
            Orbit
          </span>
        </div>
        <MobileNav role={activeRole} user={user} />
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
