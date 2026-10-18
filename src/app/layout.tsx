import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Orbit | Work, Evidence & Four Coworker Dots",
    template: "%s | Orbit",
  },
  description:
    "Find credible opportunities, build real work evidence, and collaborate with coworker Dots. Orbit connects talent, projects, and organizations.",
  keywords: [
    "jobs",
    "internships",
    "hackathons",
    "projects",
    "students",
    "founders",
    "opportunities",
    "work",
    "evidence",
    "orbit dots",
  ],
  authors: [{ name: "Orbit" }],
  creator: "Orbit",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://orbit.app",
    title: "Orbit | Work, Evidence & Four Coworker Dots",
    description:
      "Find credible opportunities, build real work evidence, and collaborate with coworker Dots.",
    siteName: "Orbit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit | Work, Evidence & Four Coworker Dots",
    description:
      "Find credible opportunities, build real work evidence, and collaborate with coworker Dots.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
