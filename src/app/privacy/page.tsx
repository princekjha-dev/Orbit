import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Orbit collects, uses, and protects your data.",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-10">Last updated: October 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">What we collect</h2>
            <p>When you create an account on Orbit, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your name and email address</li>
              <li>Profile information you choose to provide (location, college, skills, links)</li>
              <li>Usage data such as pages visited and features used</li>
              <li>Application content you submit to opportunities and projects</li>
              <li>Messages you send within the platform</li>
            </ul>
            <p className="mt-3">We do not collect payment information directly. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve the Orbit platform</li>
              <li>To match your profile with relevant opportunities</li>
              <li>To notify you about application status changes</li>
              <li>To facilitate communication between users and organizations</li>
              <li>To prevent abuse and enforce our terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Data sharing</h2>
            <p>Your profile information is visible to other users and organizations on Orbit according to your privacy settings. Application content is shared only with the organization you apply to. Messages are private between participants.</p>
            <p className="mt-3">We do not share your personal data with advertising networks or data brokers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Your rights</h2>
            <p>You can request a copy of your data, correct inaccuracies, or delete your account at any time by contacting us. Upon account deletion, your personal data will be removed within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Contact</h2>
            <p>For privacy questions, email us at privacy@orbit.app.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
