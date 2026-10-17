import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth/helpers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // Server-side guard — not just hidden UI
  return <AppShell>{children}</AppShell>;
}
