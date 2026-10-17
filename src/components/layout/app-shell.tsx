import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { Avatar } from "@/components/ui/avatar";
import { MobileNav } from "@/components/navigation/mobile-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

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

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav role={(user as any)?.role} />
        </div>

        {/* User */}
        {user && (
          <div className="px-3 py-4 border-t border-neutral-100">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Avatar
                src={user.image}
                name={user.name || "User"}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            </Link>
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
        <MobileNav role={(user as any)?.role} user={user} />
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
