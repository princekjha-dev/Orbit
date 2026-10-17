import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Orbit",
    template: "%s | Orbit",
  },
  description:
    "Find credible opportunities, build real work evidence, and track what happens next. Orbit connects talent, projects, and organizations.",
  keywords: [
    "jobs",
    "internships",
    "hackathons",
    "projects",
    "students",
    "founders",
    "opportunities",
    "work",
    "career",
  ],
  authors: [{ name: "Orbit" }],
  creator: "Orbit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Orbit",
    description:
      "Find credible opportunities, build real work evidence, and track what happens next.",
    siteName: "Orbit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit",
    description:
      "Find credible opportunities, build real work evidence, and track what happens next.",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
