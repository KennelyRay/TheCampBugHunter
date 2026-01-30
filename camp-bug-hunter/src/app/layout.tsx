import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  title: "The Camp Bug Hunter",
  description: "Report, track, and review bugs for The Camp.",
  icons: {
    icon: "/thecamp%20icon.png",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40">
          <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/80">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/Thecamplogo.png" alt="The Camp" width={160} height={36} className="h-7 w-auto object-contain sm:h-8" />
                <span className="sr-only">The Camp Bug Hunter</span>
              </Link>
              <nav className="flex items-center gap-3">
                <Link href="/" className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Home</Link>
                <Link href="/bugs" className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Bugs</Link>
                <Link href="/report" className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Report</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          <footer className="mt-16 border-t border-slate-200/60 bg-white/70 py-6 text-center text-xs text-slate-500 dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-400">
            © {new Date().getFullYear()} The Camp. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}
