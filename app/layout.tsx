import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: {
    template: "%s | Daily Digest",
    default: "Daily Digest",
  },
  description:
    "A curated daily digest of product design, AI, IoT, and career signals.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.png",
  },
  openGraph: {
    siteName: "Daily Digest",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Daily Digest",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className="font-sans">
      <body className="min-h-screen bg-base text-strong antialiased">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}