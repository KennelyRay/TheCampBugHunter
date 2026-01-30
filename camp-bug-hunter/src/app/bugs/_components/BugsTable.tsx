"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Bug } from "@/types/bug";

function StatusBadge({ status }: { status: Bug["status"] }) {
  const map: Record<Bug["status"], string> = {
    BUG: "bg-red-100 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-900/50",
    FIXED: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-900/50",
    NOT_A_BUG: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-900/50",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${map[status]}`}>{status.replaceAll("_"," ")}</span>;
}

export default function BugsTable() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(query: string = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/bugs${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBugs(data);
      setError(null);
    } catch {
      setError("Database not configured yet. Add DATABASE_URL to enable data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      load(detail);
    };
    window.addEventListener("bugs:filters", handler as EventListener);
    return () => window.removeEventListener("bugs:filters", handler as EventListener);
  }, []);

  if (loading) return <p className="text-sm text-slate-600 dark:text-slate-300">Loading...</p>;
  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/70 dark:border-slate-800/60 dark:bg-slate-950/40">
      <table className="min-w-full border-collapse">
        <thead className="bg-slate-50/80 dark:bg-slate-900/60">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Title</th>
            <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Severity</th>
            <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Status</th>
            <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Discord ID</th>
            <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Reported</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((b) => (
            <tr key={b.id} className="odd:bg-white/60 hover:bg-slate-50/70 dark:odd:bg-slate-950/20 dark:hover:bg-slate-900/60">
              <td className="border-b border-slate-200/60 px-4 py-3 text-sm text-slate-900 dark:border-slate-800/60 dark:text-slate-100">
                <Link href={`/bugs/${b.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300">
                  {b.title}
                </Link>
              </td>
              <td className="border-b border-slate-200/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-800/60 dark:text-slate-300">{b.severity}</td>
              <td className="border-b border-slate-200/60 px-4 py-3 dark:border-slate-800/60"><StatusBadge status={b.status} /></td>
              <td className="border-b border-slate-200/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-800/60 dark:text-slate-300">{b.discordId}</td>
              <td className="border-b border-slate-200/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-800/60 dark:text-slate-300">
                {new Date(b.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
          {bugs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-300">
                No bugs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
