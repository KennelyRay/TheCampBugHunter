"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/bugs", label: "Bugs", match: (path: string) => path.startsWith("/bugs") },
  { href: "/report", label: "Report", match: (path: string) => path.startsWith("/report") },
];

export default function NavBar() {
  const pathname = usePathname() ?? "/";
  const activeIndex = Math.max(0, items.findIndex((item) => item.match(pathname)));

  return (
    <nav className="relative grid grid-cols-3 items-center gap-1 rounded-full border border-[#f3a46b]/20 bg-[#0f131a]/80 p-1 text-xs font-semibold uppercase tracking-wide shadow-sm shadow-black/40">
      <div
        className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-[#f3a46b] transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {items.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className={`relative z-10 rounded-full px-4 py-2 text-center transition ${
            index === activeIndex ? "text-[#1f1a16]" : "text-slate-200 hover:bg-white/5 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
