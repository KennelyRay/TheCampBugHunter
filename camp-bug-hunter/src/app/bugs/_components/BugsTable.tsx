"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Bug } from "@/types/bug";

function StatusBadge({ status }: { status: Bug["status"] }) {
  const map: Record<Bug["status"], string> = {
    BUG: "bg-red-500/15 text-red-300 ring-red-500/30",
    FIXED: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    NOT_A_BUG: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    ON_INVESTIGATION: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${map[status]}`}>{status.replaceAll("_"," ")}</span>;
}

const severityMeta: Record<Bug["severity"], { label: string; icon: string }> = {
  LOW: { label: "Low", icon: "/Low.svg" },
  MEDIUM: { label: "Medium", icon: "/Medium.svg" },
  HIGH: { label: "High", icon: "/High.svg?v=2" },
  URGENT: { label: "Urgent", icon: "/Urgent.svg" },
};

type BugsTableProps = {
  includeHidden?: boolean;
  forceAdminLinks?: boolean;
};

export default function BugsTable({ includeHidden = false, forceAdminLinks }: BugsTableProps) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = useCallback(async (query: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams(query);
      if (includeHidden) params.set("includeHidden", "true");
      const queryString = params.toString();
      const res = await fetch(`/api/bugs${queryString ? `?${queryString}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBugs(data);
      setError(null);
    } catch {
      setError("Database not configured yet. Add DATABASE_URL to enable data.");
    } finally {
      setLoading(false);
    }
  }, [includeHidden]);

  useEffect(() => {
    const readSession = () => {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("campUser");
      if (!raw) {
        setIsAdmin(false);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        setIsAdmin(Boolean(parsed?.isAdmin));
      } catch {
        setIsAdmin(false);
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

  useEffect(() => {
    load();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      load(detail);
    };
    window.addEventListener("bugs:filters", handler as EventListener);
    return () => window.removeEventListener("bugs:filters", handler as EventListener);
  }, [load]);

  if (loading) return <p className="text-sm text-white/70">Loading...</p>;
  if (error) return <p className="text-sm text-rose-400">{error}</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-black/40 bg-[#151a21]/90">
      <table className="min-w-full border-collapse">
        <thead className="bg-[#10141b]">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white/60">
            <th className="border-b border-black/30 px-4 py-3">Title</th>
            <th className="border-b border-black/30 px-4 py-3">Severity</th>
            <th className="border-b border-black/30 px-4 py-3">Status</th>
            <th className="border-b border-black/30 px-4 py-3">Discord ID</th>
            <th className="border-b border-black/30 px-4 py-3">Reported</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((b) => (
            <tr key={b.id} className="odd:bg-[#131821] hover:bg-[#1a202a]">
              <td className="border-b border-black/30 px-4 py-3 text-sm text-white/90">
                {forceAdminLinks || isAdmin ? (
                  <Link href={`/admin/bugs/${b.id}`} className="font-semibold text-white hover:text-[#f3a46b]">
                    {b.title}
                  </Link>
                ) : (
                  <span className="font-semibold text-white">{b.title}</span>
                )}
              </td>
              <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Image src={severityMeta[b.severity].icon} alt="" width={16} height={16} className="h-4 w-4" />
                  <span>{severityMeta[b.severity].label}</span>
                </div>
              </td>
              <td className="border-b border-black/30 px-4 py-3"><StatusBadge status={b.status} /></td>
              <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">{b.discordId}</td>
              <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">
                {new Date(b.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
          {bugs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-sm text-white/60">
                No bugs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
