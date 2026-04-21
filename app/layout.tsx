import type { Metadata } from "next";
import "./globals.css";
import Masthead from "@/components/Masthead";
import TopicNav from "@/components/TopicNav";
import { getAllDates } from "@/lib/digests";

export const metadata: Metadata = {
  title: {
    template: "%s | Iura's Daily Digest",
    default: "Iura's Daily Digest",
  },
  description:
    "A curated daily digest of product design, AI, IoT, and career signals — editorial magazine format.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.png",
  },
  openGraph: {
    siteName: "Iura's Daily Digest",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Iura's Daily Digest",
      },
    ],
  },
};

function getIssueNumber(date: string): number {
  const epoch = new Date("2026-01-01");
  const d = new Date(date);
  const diff = Math.floor(
    (d.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff + 1);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dates = getAllDates();
  const latestDate = dates[0] || new Date().toISOString().slice(0, 10);
  const issueNumber = getIssueNumber(latestDate);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <Masthead date={latestDate} issueNumber={issueNumber} />
          <TopicNav />
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </main>
        <footer className="border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-500 font-sans">
          <p>
            Iura&apos;s Daily Digest &mdash; curated for{" "}
            <span className="text-gray-900">product designers</span> building in the
            AI era.
          </p>
        </footer>
      </body>
    </html>
  );
}
