import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepoRead — AI README generator",
  description: "Generate polished, editable README files for public GitHub repositories.",
  openGraph: {
    title: "RepoRead — AI README generator",
    description: "Generate polished, editable README files for public GitHub repositories.",
    url: "https://repoxread.vercel.app",
    siteName: "RepoRead",
    images: [
      {
        url: "https://repoxread.vercel.app/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "RepoRead — AI README generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepoRead — AI README generator",
    description: "Generate polished, editable README files for public GitHub repositories.",
    images: ["https://repoxread.vercel.app/opengraph-image.jpg"],
    creator: "@reporead",
  },
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-canvas-soft text-ink">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

