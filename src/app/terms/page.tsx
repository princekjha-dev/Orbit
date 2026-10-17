import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of the Orbit platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="container-orbit flex h-14 items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
            <span className="text-base font-semibold text-neutral-900">Orbit</span>
          </Link>
        </div>
      </header>
      <main className="container-orbit max-w-3xl py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-neutral-500 mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-neutral-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Using Orbit</h2>
            <p>Orbit is a platform for connecting talent with opportunities, projects, and events. By creating an account, you agree to use the platform honestly and in accordance with these terms.</p>
            <p className="mt-3">You must be at least 16 years old to use Orbit. You are responsible for maintaining the confidentiality of your account credentials.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Prohibited conduct</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Posting false or misleading opportunity listings</li>
              <li>Misrepresenting credentials, experience, or work</li>
              <li>Posting unpaid work disguised as opportunities</li>
              <li>Harassment, threats, or discriminatory behavior</li>
              <li>Scraping or automated access without permission</li>
              <li>Creating fake organizations or impersonating real ones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Organizations</h2>
            <p>Organizations are responsible for the accuracy of their listings. Verified organizations have passed our manual review process, but verification does not constitute an endorsement of any specific opportunity. Users should exercise their own judgment before accepting any role or project.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Projects and payments</h2>
            <p>Orbit facilitates connections between users and organizations for paid projects. We do not process payments or hold escrow. Payment terms are agreed directly between the user and the organization. Orbit is not liable for payment disputes, though we provide a dispute resolution process.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Content</h2>
            <p>You retain ownership of content you post on Orbit. By posting, you grant Orbit a license to display that content on the platform. We reserve the right to remove content that violates these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Termination</h2>
            <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time from your settings page.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Contact</h2>
            <p>For questions about these terms, email legal@orbit.app.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
