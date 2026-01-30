"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Bug } from "@/types/bug";

function StatusBadge({ status }: { status: Bug["status"] }) {
  const map: Record<Bug["status"], string> = {
    BUG: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    FIXED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    NOT_A_BUG: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  };
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${map[status]}`}>{status.replaceAll("_"," ")}</span>;
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

  if (loading) return <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>;
  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="text-left text-sm text-zinc-700 dark:text-zinc-300">
            <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Title</th>
            <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Severity</th>
            <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Status</th>
            <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Discord ID</th>
            <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Reported</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((b) => (
            <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">
                <Link href={`/bugs/${b.id}`} className="text-black hover:underline dark:text-white">
                  {b.title}
                </Link>
              </td>
              <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">{b.severity}</td>
              <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900"><StatusBadge status={b.status} /></td>
              <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">{b.discordId}</td>
              <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">
                {new Date(b.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
          {bugs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                No bugs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
