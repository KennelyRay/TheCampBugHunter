import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import BrandLink from "@/components/BrandLink";
import NavBar from "@/components/NavBar";
import PageTransition from "@/components/PageTransition";
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
  title: "The Camp Bug Hunter",
  description: "Report, track, and review bugs for The Camp.",
  icons: {
    icon: "/thecamp icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-[#12151b] text-foreground flex flex-col">
          <header className="sticky top-0 z-40 border-b border-black/40 bg-gradient-to-r from-[#12161d] via-[#171d25] to-[#12161d] shadow-lg shadow-black/30 backdrop-blur">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
              <BrandLink />
              <NavBar />
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
            <PageTransition>{children}</PageTransition>
          </main>
          <footer className="relative z-20 mt-16 border-t border-white/10 bg-gradient-to-r from-[#141922] via-[#1a202a] to-[#141922] py-10 text-white/70">
            <div className="mx-auto max-w-6xl px-6 grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Image src="/thecamp icon.png" alt="The Camp icon" width={36} height={36} className="h-9 w-9 rounded-full border border-white/10 bg-black/20 p-1" />
                  <div>
                    <div className="text-sm font-semibold text-white">The Camp Bug Hunter</div>
                    <div className="text-xs text-white/50">Bug reporting hub</div>
                  </div>
                </div>
                <p className="text-xs text-white/50">Keep the server experience polished with fast triage and clear reporting.</p>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Quick Links</span>
                <Link href="/" className="text-white/70 hover:text-[#f3a46b]">Home</Link>
                <Link href="/bugs" className="text-white/70 hover:text-[#f3a46b]">Bugs</Link>
                <Link href="/report" className="text-white/70 hover:text-[#f3a46b]">Report</Link>
              </div>
              <div className="flex flex-col gap-2 text-xs sm:items-end">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Community</span>
                <span className="text-white/70">Discord.gg/TheCamp</span>
                <span className="text-white/40">© {new Date().getFullYear()} The Camp</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
