import type { Metadata } from "next";
import Link from "next/link";
import { ORBIT_AVATAR } from "@/lib/avatars";

export const metadata: Metadata = {
  title: "Account | Orbit",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-between py-12 px-4 sm:px-6 antialiased text-[#1D1D1F]">
      {/* Minimal Top Brand Bar */}
      <div className="flex justify-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus-visible:outline-none"
        >
          <div className="h-8 w-8 rounded-[8px] overflow-hidden flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ORBIT_AVATAR}
              alt="Orbit"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
            Orbit
          </span>
        </Link>
      </div>

      {/* Centered Auth Card with generous whitespace */}
      <div className="w-full max-w-[420px] mx-auto my-auto">
        <div className="bg-[#FFFFFF] border border-[#E5E5EA] rounded-2xl shadow-subtle p-7 sm:p-9">
          {children}
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="text-center text-xs text-[#86868B] space-x-4 pb-4">
        <Link href="/privacy" className="hover:text-[#1D1D1F] transition-colors">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link href="/terms" className="hover:text-[#1D1D1F] transition-colors">
          Terms of Service
        </Link>
        <span>•</span>
        <Link href="/safety" className="hover:text-[#1D1D1F] transition-colors">
          Security Standards
        </Link>
      </div>
    </div>
  );
}
