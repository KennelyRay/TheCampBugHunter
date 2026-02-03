"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Bug, Severity, Status } from "@/types/bug";

export default function AdminPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [discordId, setDiscordId] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (severity) params.set("severity", severity);
      if (discordId) params.set("discordId", discordId);
      params.set("includeHidden", "true");
      const res = await fetch(`/api/bugs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      setBugs(await res.json());
      setError(null);
    } catch {
      setError("Database not configured yet. Add DATABASE_URL to enable data.");
    } finally {
      setLoading(false);
    }
  }, [status, severity, discordId]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    return {
      total: bugs.length,
      low: bugs.filter((b) => b.severity === "LOW").length,
      medium: bugs.filter((b) => b.severity === "MEDIUM").length,
      high: bugs.filter((b) => b.severity === "HIGH").length,
      urgent: bugs.filter((b) => b.severity === "URGENT").length,
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

  async function updateHidden(id: string, hidden: boolean) {
    const res = await fetch(`/api/bugs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden }),
    });
    if (res.ok) {
      await load();
    }
  }

  async function deleteBug(id: string) {
    const confirmed = window.confirm("Delete this bug permanently?");
    if (!confirmed) return;
    const res = await fetch(`/api/bugs/${id}`, { method: "DELETE" });
    if (res.ok) {
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <h2 className="text-2xl font-semibold text-white">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-white/70">Review reports, filter quickly, and update statuses.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-white/80">Status</label>
            <select
              className="mt-1 w-48 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status | "")}
            >
              <option value="">All</option>
              <option value="BUG">Bug</option>
              <option value="NOT_A_BUG">Not a Bug</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Severity</label>
            <select
              className="mt-1 w-48 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity | "")}
            >
              <option value="">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-white/80">Discord ID</label>
            <input
              className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
            />
          </div>
          <button
            className="rounded-lg bg-[#f3a46b] px-4 py-2 text-sm font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
            onClick={load}
          >
            Apply
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-4 text-white shadow-lg shadow-black/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Total</div>
          <div className="mt-2 text-2xl font-semibold">{counts.total}</div>
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-4 text-white shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
            <Image src="/Urgent.svg" alt="" width={16} height={16} className="h-4 w-4" />
            <span>Urgent</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">{counts.urgent}</div>
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-4 text-white shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
            <Image src="/High.svg?v=2" alt="" width={16} height={16} className="h-4 w-4" />
            <span>High</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">{counts.high}</div>
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-4 text-white shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
            <Image src="/Medium.svg" alt="" width={16} height={16} className="h-4 w-4" />
            <span>Medium</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">{counts.medium}</div>
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-4 text-white shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
            <Image src="/Low.svg" alt="" width={16} height={16} className="h-4 w-4" />
            <span>Low</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">{counts.low}</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-black/40 bg-[#151a21]/90 shadow-lg shadow-black/30">
        {loading && <p className="px-6 py-4 text-sm text-white/70">Loading...</p>}
        {error && <p className="px-6 py-4 text-sm text-rose-400">{error}</p>}
        {!loading && !error && (
          <table className="min-w-full border-collapse">
            <thead className="bg-[#10141b]">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white/60">
                <th className="border-b border-black/30 px-4 py-3">User</th>
                <th className="border-b border-black/30 px-4 py-3">Title</th>
                <th className="border-b border-black/30 px-4 py-3">Severity</th>
                <th className="border-b border-black/30 px-4 py-3">Status</th>
                <th className="border-b border-black/30 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((b) => (
                <tr key={b.id} className="odd:bg-[#131821] hover:bg-[#1a202a]">
                  <td className="border-b border-black/30 px-4 py-3 text-sm text-white/90">
                    {b.minecraftIgn} • {b.discordId}
                  </td>
                  <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{b.title}</span>
                      {b.hidden && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                          Hidden
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">{b.severity}</td>
                  <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">
                    {b.status.replaceAll("_", " ")}
                  </td>
                  <td className="border-b border-black/30 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/bugs/${b.id}?admin=1`}
                        className="rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                      >
                        View
                      </Link>
                      <button
                        className="rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                        onClick={() => updateStatus(b.id, "BUG")}
                      >
                        Mark Bug
                      </button>
                      <button
                        className="rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                        onClick={() => updateStatus(b.id, "NOT_A_BUG")}
                      >
                        Not a Bug
                      </button>
                      <button
                        className="rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                        onClick={() => updateStatus(b.id, "FIXED")}
                      >
                        Mark Fixed
                      </button>
                      <button
                        className="rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                        onClick={() => updateHidden(b.id, !b.hidden)}
                      >
                        {b.hidden ? "Unhide" : "Hide"}
                      </button>
                      <button
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-red-400/70 hover:bg-red-500/20 hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                        onClick={() => deleteBug(b.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bugs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-white/60">
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
