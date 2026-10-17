import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle, Briefcase, FolderKanban, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="container-orbit">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              <span className="text-base font-semibold text-neutral-900 tracking-tight">
                Orbit
              </span>
            </div>
            <nav className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-4">
        <div className="container-orbit max-w-4xl">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
              Now in early access
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight tracking-tight text-balance mb-6">
            Find credible opportunities,
            <br className="hidden sm:block" />
            build real work evidence.
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mb-8 leading-relaxed">
            Orbit connects students and freshers to verified organizations, scoped projects, 
            events, and hackathons. Every completed project creates a verified work record 
            that any recruiter or founder can inspect.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start building your profile
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core loop */}
      <section className="py-16 border-t border-neutral-100 bg-neutral-50">
        <div className="container-orbit">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
              How Orbit works
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              One practical loop designed around real outcomes, not engagement metrics.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { step: "Discover", desc: "Browse verified jobs, projects, and events" },
              { step: "Apply", desc: "Submit a focused application with your profile" },
              { step: "Work", desc: "Deliver a defined, scoped piece of work" },
              { step: "Prove", desc: "Receive a verified work record with evidence" },
              { step: "Outcome", desc: "Build a track record that recruiters can inspect" },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
                  <div className="h-8 w-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 mb-1">
                    {item.step}
                  </p>
                  <p className="text-xs text-neutral-500">{item.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden sm:block absolute top-8 -right-2 text-neutral-300 z-10">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-neutral-100">
        <div className="container-orbit">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Briefcase,
                title: "Verified Opportunities",
                desc: "Jobs, internships, and startup roles from organizations that have passed our verification process.",
              },
              {
                icon: FolderKanban,
                title: "Scoped Projects",
                desc: "Short, clearly defined paid projects with deliverables, acceptance criteria, and payment terms upfront.",
              },
              {
                icon: Calendar,
                title: "Events and Hackathons",
                desc: "Find nearby hackathons, workshops, demo days, and career events. Form teams and submit projects.",
              },
              {
                icon: Shield,
                title: "Verified Work Records",
                desc: "Every completed project generates a public work record with the deliverable, scope, and reviewer notes.",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="border border-neutral-200 rounded-xl p-5 bg-white">
                  <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For orgs */}
      <section className="py-16 border-t border-neutral-100 bg-neutral-50">
        <div className="container-orbit">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                For organizations and founders
              </h2>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Post opportunities, publish scoped projects, and find people who 
                can actually do the work. Our verification process builds trust 
                with applicants so they know your listing is real.
              </p>
              <ul className="space-y-3">
                {[
                  "Post jobs, internships, and paid projects",
                  "Review applications against real work samples",
                  "Manage project delivery with built-in review workflow",
                  "Issue verified work records to collaborators",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-neutral-700">
                    <CheckCircle className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/signup">
                  <Button>
                    Create organization
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Example: Frontend Developer</p>
                  <p className="text-xs text-neutral-500">Acme Labs · Remote · Internship</p>
                </div>
                <span className="ml-auto text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md">
                  Verified
                </span>
              </div>
              <div className="space-y-2 text-sm text-neutral-600">
                <p><span className="font-medium text-neutral-900">Skills:</span> React, TypeScript, CSS</p>
                <p><span className="font-medium text-neutral-900">Duration:</span> 3 months</p>
                <p><span className="font-medium text-neutral-900">Compensation:</span> Paid, market rate</p>
                <p><span className="font-medium text-neutral-900">Deadline:</span> Nov 15, 2026</p>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-500">
                  Applications reviewed by the founding team. Decision within 2 weeks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-neutral-100">
        <div className="container-orbit text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to build a real track record?
          </h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            Join students, freshers, and founders who are using Orbit to connect 
            with real work and credible organizations.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Create your profile
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="container-orbit">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-brand-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">Orbit</span>
            </div>
            <nav className="flex items-center gap-4 text-xs text-neutral-500">
              <Link href="/privacy" className="hover:text-neutral-700 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-neutral-700 transition-colors">Terms</Link>
              <Link href="/safety" className="hover:text-neutral-700 transition-colors">Safety</Link>
            </nav>
            <p className="text-xs text-neutral-400">
              {new Date().getFullYear()} Orbit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
