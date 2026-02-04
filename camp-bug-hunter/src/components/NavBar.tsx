"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const items = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/bugs", label: "Bugs", match: (path: string) => path.startsWith("/bugs") },
  { href: "/report", label: "Report", match: (path: string) => path.startsWith("/report") },
];

type UserSession = {
  email: string;
  minecraftUsername: string;
};

export default function NavBar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const activeIndex = Math.max(0, items.findIndex((item) => item.match(pathname)));
  const showTabs = !pathname.startsWith("/admin");
  const [user, setUser] = useState<UserSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [avatarFailedFor, setAvatarFailedFor] = useState<string | null>(null);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const readSession = () => {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("campUser");
      if (!raw) {
        setUser(null);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.minecraftUsername) {
          setUser({
            email: parsed.email ?? "",
            minecraftUsername: parsed.minecraftUsername,
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    readSession();
    const handler = () => readSession();
    window.addEventListener("storage", handler);
    window.addEventListener("camp-auth", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("camp-auth", handler);
    };
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("campUser");
      window.dispatchEvent(new Event("camp-auth"));
    }
    setMenuOpen(false);
    setStatusMessage("Successfully logged out, please wait!");
    window.setTimeout(() => {
      setStatusMessage(null);
      router.push("/");
    }, 1000);
  }

  const avatarUrl = user
    ? `https://minotar.net/helm/${encodeURIComponent(user.minecraftUsername)}/32.png`
    : "";
  const fallbackUrl = "https://minotar.net/helm/Steve/32.png";
  const avatarFailed = Boolean(user && avatarFailedFor === user.minecraftUsername);

  return (
    <nav className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
      {isClient &&
        statusMessage &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f131a]/90 backdrop-blur transition-opacity duration-500">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#141922]/80 px-8 py-6 text-white shadow-2xl shadow-black/50">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-12 w-12 rounded-full bg-[#f3a46b]/20 blur-xl"></span>
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#f3a46b]/30 border-t-[#f3a46b]"></span>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f3a46b]/90">Success</div>
                <div className="mt-2 text-xs text-white/70">{statusMessage}</div>
              </div>
            </div>
          </div>,
          document.body
        )}
      {showTabs && (
        <div className="relative grid grid-cols-3 items-center gap-1 rounded-full border border-[#f3a46b]/20 bg-[#0f131a]/80 p-1 shadow-sm shadow-black/40">
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
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
      {user ? (
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-[#f3a46b]/40 bg-[#0f131a]/80 px-3 py-2 text-[#f3a46b] shadow-lg shadow-black/40 transition hover:border-[#f3a46b] hover:bg-[#f3a46b]/10"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Image
              src={avatarFailed ? fallbackUrl : avatarUrl}
              alt={`${user.minecraftUsername} avatar`}
              width={28}
              height={28}
              className="rounded-md border border-white/10"
              onError={() => setAvatarFailedFor(user.minecraftUsername)}
            />
            <span className="hidden text-[11px] sm:inline">{user.minecraftUsername}</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-[#f3a46b]/20 bg-[#0f131a]/95 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
                <Image
                  src={avatarFailed ? fallbackUrl : avatarUrl}
                  alt={`${user.minecraftUsername} avatar`}
                  width={36}
                  height={36}
                  className="rounded-lg border border-white/10"
                  onError={() => setAvatarFailedFor(user.minecraftUsername)}
                />
                <div>
                  <div className="text-sm font-semibold text-white">{user.minecraftUsername}</div>
                  <div className="text-[11px] text-white/50">{user.email || "No email on file"}</div>
                </div>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-[#141922] hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-[#f3a46b]">
                    <path
                      d="M3.5 10.5h5v6h-5v-6ZM11.5 3.5h5v13h-5v-13ZM3.5 3.5h5v5h-5v-5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-[#141922] hover:text-white"
                  onClick={handleLogout}
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-[#f3a46b]">
                    <path
                      d="M8 4h5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10H3m0 0 2.5-2.5M3 10l2.5 2.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-full border border-[#f3a46b]/60 px-4 py-2 text-[#f3a46b] transition hover:border-[#f3a46b] hover:bg-[#f3a46b]/10 hover:text-[#f3a46b]"
        >
          Login
        </Link>
      )}
    </nav>
  );
}
