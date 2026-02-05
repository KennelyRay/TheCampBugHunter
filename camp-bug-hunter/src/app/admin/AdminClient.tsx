"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Bug, Severity, Status } from "@/types/bug";

const statusFilterOptions: { value: Status; label: string }[] = [
  { value: "BUG", label: "Bug" },
  { value: "ON_INVESTIGATION", label: "On Investigation" },
  { value: "FIXED", label: "Fixed" },
  { value: "NOT_A_BUG", label: "Not a Bug" },
];

const statusUpdateOptions: { value: Status; label: string }[] = [
  { value: "FIXED", label: "Bug Fixed" },
  { value: "NOT_A_BUG", label: "Not a Bug" },
  { value: "ON_INVESTIGATION", label: "On Investigation" },
];

export default function AdminClient() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [discordId, setDiscordId] = useState<string>("");
  const [statusOpenFor, setStatusOpenFor] = useState<string | null>(null);
  const [statusSelection, setStatusSelection] = useState<Status | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bug | null>(null);
  const [deletePending, setDeletePending] = useState(false);

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
    const res = await fetch(`/api/bugs/${id}?admin=1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    if (res.ok) {
      await load();
    }
    return res.ok;
  }

  async function updateHidden(id: string, hidden: boolean) {
    const res = await fetch(`/api/bugs/${id}?admin=1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden }),
    });
    if (res.ok) {
      await load();
    }
  }

  async function deleteBug(id: string) {
    const res = await fetch(`/api/bugs/${id}?admin=1`, { method: "DELETE" });
    if (res.ok) {
      await load();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deletePending) return;
    setDeletePending(true);
    await deleteBug(deleteTarget.id);
    setDeletePending(false);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      {statusToast && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 shadow-lg shadow-black/20">
          {statusToast}
        </div>
      )}
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
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                      <Link
                        href={`/bugs/${b.id}?admin=1`}
                        className="inline-flex items-center justify-center rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                      >
                        View
                      </Link>
                      <button
                        className="inline-flex items-center justify-center rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                        onClick={() => {
                          setStatusSelection(b.status);
                          setStatusOpenFor(b.id);
                        }}
                        type="button"
                      >
                        Mark Status
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                        onClick={() => updateHidden(b.id, !b.hidden)}
                      >
                        {b.hidden ? "Unhide" : "Hide"}
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-red-400/70 hover:bg-red-500/20 hover:shadow-black/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                        onClick={() => setDeleteTarget(b)}
                      >
                        Delete
                      </button>
                    </div>
                    {statusOpenFor === b.id && (
                      <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center bg-black/60 px-4 py-6 sm:items-center">
                          <div className="w-full max-w-md rounded-2xl border border-black/40 bg-[#151a21]/95 p-5 text-white shadow-2xl shadow-black/60 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Mark Status</div>
                                <div className="mt-1 text-sm text-white/70">Pick a status, then set it.</div>
                              </div>
                              <span className="rounded-full border border-white/10 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                                Current: {b.status.replaceAll("_", " ")}
                              </span>
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                              {statusUpdateOptions.map((option) => {
                                const isSelected = statusSelection === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out ${
                                      isSelected
                                        ? "border-[#f3a46b]/70 bg-[#f3a46b]/10 text-[#f3a46b] shadow-lg shadow-black/30"
                                        : "border-black/40 bg-[#0f131a]/80 text-white/80 hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:text-white"
                                    }`}
                                    onClick={() => setStatusSelection(option.value)}
                                  >
                                    <span>{option.label}</span>
                                    {isSelected && (
                                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f3a46b]/20">
                                        <svg
                                          viewBox="0 0 20 20"
                                          fill="none"
                                          aria-hidden="true"
                                          className="h-3.5 w-3.5 text-[#f3a46b]"
                                        >
                                          <path
                                            d="M5 10.5l3.2 3.2L15 7.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                              <button
                                type="button"
                                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                                onClick={() => {
                                  setStatusOpenFor(null);
                                  setStatusSelection(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className={`rounded-lg px-5 py-2 text-xs font-semibold shadow-lg transition-all duration-200 ease-out ${
                                  statusSelection && !statusPending
                                    ? "bg-[#f3a46b] text-[#1f1a16] shadow-[#f3a46b]/30 hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-[#f3a46b]/40"
                                    : "cursor-not-allowed bg-[#f3a46b]/40 text-[#1f1a16]/60 shadow-none"
                                }`}
                                disabled={!statusSelection || statusPending}
                                onClick={async () => {
                                  if (!statusSelection) return;
                                  setStatusPending(true);
                                  const ok = await updateStatus(b.id, statusSelection);
                                  setStatusPending(false);
                                  if (ok) {
                                    setStatusOpenFor(null);
                                    setStatusSelection(null);
                                    setStatusToast("Successfully set status");
                                    window.setTimeout(() => setStatusToast(null), 2500);
                                  }
                                }}
                              >
                                {statusPending ? "Setting..." : "Set"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center bg-black/60 px-4 py-6 sm:items-center">
            <div className="w-full max-w-md rounded-2xl border border-black/40 bg-[#151a21]/95 p-5 text-white shadow-2xl shadow-black/60 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-rose-300/80">Confirm Delete</div>
              <div className="mt-2 text-sm text-white/70">
                Delete <span className="font-semibold text-white">{deleteTarget.title}</span>? This cannot be undone.
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deletePending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-5 py-2 text-xs font-semibold shadow-lg transition-all duration-200 ease-out ${
                    deletePending
                      ? "cursor-not-allowed bg-red-500/40 text-red-100/60 shadow-none"
                      : "bg-red-500/80 text-white shadow-red-500/30 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-500/40"
                  }`}
                  onClick={confirmDelete}
                  disabled={deletePending}
                >
                  {deletePending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
