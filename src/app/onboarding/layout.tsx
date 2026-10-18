import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Orbit",
  description: "Complete your Orbit profile, select your role, and set up your workspace.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
