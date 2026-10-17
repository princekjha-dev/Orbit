import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">O</span>
            </div>
            <span className="text-xl font-semibold text-neutral-900 tracking-tight">
              Orbit
            </span>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl shadow-soft p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
