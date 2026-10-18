import { AppShell } from "@/components/layout/app-shell";
import { OrbitModSubNav } from "@/components/orbitmod/mod-nav";

export const metadata = {
  title: "OrbitMod V5 | Four Dots Platform",
  description: "Avis, Scout, Quill, and Relay — Trust, Matching, Proof-of-Work and Collaboration.",
};

export default function OrbitModLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <OrbitModSubNav />
      <div className="bg-neutral-50/50 min-h-[calc(100vh-3.5rem)]">{children}</div>
    </AppShell>
  );
}
