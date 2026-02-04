"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Bug, Severity } from "@/types/bug";

type UserSession = {
  email?: string;
  minecraftUsername: string;
};

const severityOptions: { value: Severity; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeBug, setActiveBug] = useState<Bug | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reproductionSteps, setReproductionSteps] = useState("");
  const [severity, setSeverity] = useState<Severity>("LOW");
  const [evidenceLinks, setEvidenceLinks] = useState("");

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

  async function loadBugs(minecraftIgn: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bugs?minecraftIgn=${encodeURIComponent(minecraftIgn)}`);
      if (!res.ok) {
        setError("Unable to load your reports right now.");
        setBugs([]);
        return;
      }
      const data = (await res.json()) as Bug[];
      setBugs(data);
    } catch {
      setError("Unable to load your reports right now.");
      setBugs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.minecraftUsername) return;
    loadBugs(user.minecraftUsername);
  }, [user?.minecraftUsername]);

  const stats = useMemo(() => {
    const total = bugs.length;
    const open = bugs.filter((bug) => bug.status === "BUG" || bug.status === "ON_INVESTIGATION").length;
    const fixed = bugs.filter((bug) => bug.status === "FIXED").length;
    return { total, open, fixed };
  }, [bugs]);

  function startEdit(bug: Bug) {
    setActiveBug(bug);
    setTitle(bug.title);
    setDescription(bug.description);
    setReproductionSteps(bug.reproductionSteps);
    setSeverity(bug.severity);
    setEvidenceLinks(bug.evidenceLinks.join("\n"));
  }

  function resetEdit() {
    setActiveBug(null);
    setTitle("");
    setDescription("");
    setReproductionSteps("");
    setSeverity("LOW");
    setEvidenceLinks("");
  }

  async function saveEdit() {
    if (!user?.minecraftUsername || !activeBug) return;
    setLoading(true);
    setError(null);
    const links = evidenceLinks
      .split(/\n|,/)
      .map((link) => link.trim())
      .filter((link) => link.length > 0);
    try {
      const res = await fetch(`/api/bugs/${activeBug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minecraftIgn: user.minecraftUsername,
          title,
          description,
          reproductionSteps,
          severity,
          evidenceLinks: links,
        }),
      });
      if (!res.ok) {
        setError("Unable to update the report.");
        return;
      }
      await loadBugs(user.minecraftUsername);
      setStatusMessage("Report updated.");
      resetEdit();
      window.setTimeout(() => setStatusMessage(null), 1800);
    } catch {
      setError("Unable to update the report.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBug(id: string) {
    if (!user?.minecraftUsername) return;
    const confirmed = window.confirm("Delete this report permanently?");
    if (!confirmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/bugs/${id}?minecraftIgn=${encodeURIComponent(user.minecraftUsername)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        setError("Unable to delete the report.");
        return;
      }
      await loadBugs(user.minecraftUsername);
      if (activeBug?.id === id) resetEdit();
      setStatusMessage("Report deleted.");
      window.setTimeout(() => setStatusMessage(null), 1800);
    } catch {
      setError("Unable to delete the report.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
          <h2 className="text-2xl font-semibold text-white">User Dashboard</h2>
          <p className="mt-2 text-sm text-white/70">
            Sign in to view and manage your reported bugs.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#f3a46b] px-4 py-2 text-sm font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 shadow-lg shadow-black/20">
          {statusMessage}
        </div>
      )}
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
        <h2 className="text-2xl font-semibold text-white">User Dashboard</h2>
        <p className="mt-1 text-sm text-white/70">
          Manage your reported bugs, update details, or remove entries that are no longer relevant.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-4 text-white shadow-lg shadow-black/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Total Reports</div>
          <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-4 text-white shadow-lg shadow-black/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Open</div>
          <div className="mt-2 text-2xl font-semibold">{stats.open}</div>
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-4 text-white shadow-lg shadow-black/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Fixed</div>
          <div className="mt-2 text-2xl font-semibold">{stats.fixed}</div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-black/40 bg-[#151a21]/90 shadow-lg shadow-black/30">
          {loading && <p className="px-6 py-4 text-sm text-white/70">Loading...</p>}
          {error && <p className="px-6 py-4 text-sm text-rose-400">{error}</p>}
          {!loading && !error && (
            <table className="min-w-full border-collapse">
              <thead className="bg-[#10141b]">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white/60">
                  <th className="border-b border-black/30 px-4 py-3">Title</th>
                  <th className="border-b border-black/30 px-4 py-3">Severity</th>
                  <th className="border-b border-black/30 px-4 py-3">Status</th>
                  <th className="border-b border-black/30 px-4 py-3">Created</th>
                  <th className="border-b border-black/30 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bugs.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-white/60" colSpan={5}>
                      No reports yet. Submit your first bug report to see it here.
                    </td>
                  </tr>
                )}
                {bugs.map((bug) => (
                  <tr key={bug.id} className="odd:bg-[#131821] hover:bg-[#1a202a]">
                    <td className="border-b border-black/30 px-4 py-3 text-sm text-white/90">{bug.title}</td>
                    <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">{bug.severity}</td>
                    <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">
                      {bug.status.replaceAll("_", " ")}
                    </td>
                    <td className="border-b border-black/30 px-4 py-3 text-sm text-white/70">
                      {new Date(bug.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border-b border-black/30 px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
                          onClick={() => startEdit(bug)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-rose-400/60 hover:bg-rose-500/20 hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
                          onClick={() => deleteBug(bug.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
          <h3 className="text-lg font-semibold text-white">Edit Report</h3>
          {activeBug ? (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Severity</label>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value as Severity)}
                  className="mt-2 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                >
                  {severityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reproduction Steps</label>
                <textarea
                  value={reproductionSteps}
                  onChange={(event) => setReproductionSteps(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
                  Evidence Links
                </label>
                <textarea
                  value={evidenceLinks}
                  onChange={(event) => setEvidenceLinks(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-[#f3a46b] px-4 py-2 text-xs font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98]"
                  onClick={saveEdit}
                  disabled={loading}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-[#0f131a]/80 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-[#141922] hover:text-white"
                  onClick={resetEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/60">Select a report to edit.</p>
          )}
        </div>
      </div>
    </div>
  );
}
