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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="text-2xl font-semibold text-black dark:text-white">Admin Dashboard</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Sort by users, severity, and Discord ID. Update bug status.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
          <select className="mt-1 w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" value={status} onChange={(e) => setStatus(e.target.value as Status | "")}>
            <option value="">All</option>
            <option value="BUG">Bug</option>
            <option value="NOT_A_BUG">Not a Bug</option>
            <option value="FIXED">Fixed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Severity</label>
          <select className="mt-1 w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "")}>
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Discord ID</label>
          <input className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
        </div>
        <button className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200" onClick={load}>
          Apply
        </button>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total</div>
          <div className="text-2xl font-semibold text-black dark:text-white">{counts.total}</div>
        </div>
        <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">High</div>
          <div className="text-2xl font-semibold text-black dark:text-white">{counts.high}</div>
        </div>
        <div className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Medium</div>
          <div className="text-2xl font-semibold text-black dark:text-white">{counts.medium}</div>
        </div>
      </div>
      <div className="mt-8 overflow-x-auto">
        {loading && <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        {!loading && !error && (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-left text-sm text-zinc-700 dark:text-zinc-300">
                <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">User</th>
                <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Title</th>
                <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Severity</th>
                <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Status</th>
                <th className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                  <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">
                    {b.minecraftIgn} • {b.discordId}
                  </td>
                  <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">{b.title}</td>
                  <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">{b.severity}</td>
                  <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">{b.status.replaceAll("_"," ")}</td>
                  <td className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-900">
                    <div className="flex gap-2">
                      <button className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" onClick={() => updateStatus(b.id, "BUG")}>
                        Mark Bug
                      </button>
                      <button className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" onClick={() => updateStatus(b.id, "NOT_A_BUG")}>
                        Not a Bug
                      </button>
                      <button className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" onClick={() => updateStatus(b.id, "FIXED")}>
                        Mark Fixed
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bugs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-zinc-600 dark:text-zinc-400">No items</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
