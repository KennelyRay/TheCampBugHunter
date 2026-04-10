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
  title: "MasterCraft Bug Hunter",
  description: "Report, track, and review bugs for MasterCraft.",
  icons: {
    icon: [{ url: "/MasterCraftIcon.png", type: "image/png" }],
    shortcut: "/MasterCraftIcon.png",
    apple: "/MasterCraftIcon.png",
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
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <BrandLink />
              <NavBar />
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            <PageTransition>{children}</PageTransition>
          </main>
          <footer className="relative z-20 mt-16 border-t border-white/10 bg-gradient-to-r from-[#141922] via-[#1a202a] to-[#141922] py-10 text-white/70">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3 sm:px-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Image src="/MasterCraftIcon.png" alt="MasterCraft icon" width={36} height={36} className="h-9 w-9 rounded-full border border-white/10 bg-black/20 p-1" />
                  <div>
                    <div className="text-sm font-semibold text-white">MasterCraft Bug Hunter</div>
                    <div className="text-xs text-white/50">Bug reporting hub</div>
                  </div>
                </div>
                <p className="text-xs text-white/50">Keep the server experience polished with fast triage and clear reporting.</p>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Quick Links</span>
                <Link href="/" className="text-white/70 hover:text-[#22d3ee]">Home</Link>
                <Link href="/bugs" className="text-white/70 hover:text-[#22d3ee]">Bugs</Link>
                <Link href="/report" className="text-white/70 hover:text-[#22d3ee]">Report</Link>
              </div>
              <div className="flex flex-col gap-2 text-xs sm:items-end">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Community</span>
                <span className="text-white/70">Discord.gg/MasterCraft</span>
                <span className="text-white/40">© {new Date().getFullYear()} MasterCraft</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
