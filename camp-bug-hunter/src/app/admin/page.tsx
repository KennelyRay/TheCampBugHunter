"use client";
import { useEffect, useMemo, useState } from "react";
import type { Bug, Severity, Status } from "@/types/bug";

export default function AdminPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [discordId, setDiscordId] = useState<string>("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (severity) params.set("severity", severity);
      if (discordId) params.set("discordId", discordId);
      const res = await fetch(`/api/bugs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      setBugs(await res.json());
      setError(null);
    } catch {
      setError("Database not configured yet. Add DATABASE_URL to enable data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    return {
      total: bugs.length,
      low: bugs.filter((b) => b.severity === "LOW").length,
      medium: bugs.filter((b) => b.severity === "MEDIUM").length,
      high: bugs.filter((b) => b.severity === "HIGH").length,
    };
  }, [bugs]);

  async function updateStatus(id: string, s: Status) {
    const res = await fetch(`/api/bugs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    if (res.ok) {
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Sort by users, severity, and Discord ID. Update bug status.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
            <select className="mt-1 w-48 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" value={status} onChange={(e) => setStatus(e.target.value as Status | "")}>
              <option value="">All</option>
              <option value="BUG">Bug</option>
              <option value="NOT_A_BUG">Not a Bug</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Severity</label>
            <select className="mt-1 w-48 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "")}>
              <option value="">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Discord ID</label>
            <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
          </div>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100" onClick={load}>
            Apply
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">High</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.high}</div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Medium</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.medium}</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        {loading && <p className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">Loading...</p>}
        {error && <p className="px-6 py-4 text-sm text-red-600 dark:text-red-300">{error}</p>}
        {!loading && !error && (
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">User</th>
                <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Title</th>
                <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Severity</th>
                <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Status</th>
                <th className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((b) => (
                <tr key={b.id} className="odd:bg-white/60 hover:bg-slate-50/70 dark:odd:bg-slate-950/20 dark:hover:bg-slate-900/60">
                  <td className="border-b border-slate-200/60 px-4 py-3 text-sm text-slate-900 dark:border-slate-800/60 dark:text-slate-100">
                    {b.minecraftIgn} • {b.discordId}
                  </td>
                  <td className="border-b border-slate-200/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-800/60 dark:text-slate-300">{b.title}</td>
                  <td className="border-b border-slate-200/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-800/60 dark:text-slate-300">{b.severity}</td>
                  <td className="border-b border-slate-200/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-800/60 dark:text-slate-300">{b.status.replaceAll("_"," ")}</td>
                  <td className="border-b border-slate-200/60 px-4 py-3 dark:border-slate-800/60">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900" onClick={() => updateStatus(b.id, "BUG")}>
                        Mark Bug
                      </button>
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900" onClick={() => updateStatus(b.id, "NOT_A_BUG")}>
                        Not a Bug
                      </button>
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900" onClick={() => updateStatus(b.id, "FIXED")}>
                        Mark Fixed
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bugs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-300">No items</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
