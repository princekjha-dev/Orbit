import Link from "next/link";
import type { Metadata } from "next";
import { Shield, Flag, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Safety",
  description: "How Orbit keeps the platform safe and trustworthy.",
};

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="container-orbit flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
            <span className="text-base font-semibold text-neutral-900">Orbit</span>
          </Link>
        </div>
      </header>
      <main className="container-orbit max-w-3xl py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Safety on Orbit</h1>
        <p className="text-neutral-600 mb-12 text-base leading-relaxed">
          Orbit is built on the principle that every opportunity listed should be real, every organization should be accountable, and every user should be safe.
        </p>

        <div className="grid grid-cols-1 gap-8">
          {[
            {
              icon: Shield,
              title: "Organization verification",
              body: "Organizations go through a manual verification process before receiving a Verified badge. Verification involves reviewing evidence of legitimacy, including website, registration documents, and contact details. Unverified organizations can still post, but are clearly labeled.",
            },
            {
              icon: CheckCircle,
              title: "No unpaid labor",
              body: "Orbit does not allow unpaid internships, spec work, or volunteer-only listings disguised as opportunities. All project listings must include payment terms. We remove listings that violate this policy.",
            },
            {
              icon: Flag,
              title: "Reporting content",
              body: "Every listing, organization, and user can be reported. Reports go to our moderation team and are reviewed within 48 hours. We act on confirmed violations including suspension and content removal.",
            },
            {
              icon: AlertTriangle,
              title: "Protecting your information",
              body: "We do not share your contact details or application content with organizations without your consent. Your private messages are end-to-end protected and not visible to third parties.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-5">
                <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-900 mb-2">{item.title}</h2>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
          <h2 className="text-base font-semibold text-neutral-900 mb-2">Report a problem</h2>
          <p className="text-sm text-neutral-600 mb-4">
            If you encounter a suspicious listing, fraudulent organization, or any safety concern, use the report button on any listing or email us directly.
          </p>
          <a href="mailto:safety@orbit.app"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline">
            safety@orbit.app
          </a>
        </div>
      </main>
    </div>
  );
}
