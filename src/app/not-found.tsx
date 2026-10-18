import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { ORBIT_AVATAR } from "@/lib/avatars";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-xs space-y-6">
        <div className="h-16 w-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ORBIT_AVATAR} alt="Orbit" className="h-10 w-10 object-contain" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            404 Not Found
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 mt-3">
            Out of Orbit
          </h1>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            The page or resource you are looking for does not exist, has been moved, or is restricted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/opportunities"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Browse Opportunities</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
