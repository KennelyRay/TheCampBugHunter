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
  const [reproductionSteps, setReproductionSteps] = useState<string[]>([""]);
  const [severity, setSeverity] = useState<Severity>("LOW");
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([""]);

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
    const parsedSteps = bug.reproductionSteps
      .split("\n")
      .map((step) => step.replace(/^\s*\d+\.\s*/, "").trim())
      .filter((step) => step.length > 0);
    setActiveBug(bug);
    setTitle(bug.title);
    setDescription(bug.description);
    setReproductionSteps(parsedSteps.length ? parsedSteps : [""]);
    setSeverity(bug.severity);
    setEvidenceLinks(bug.evidenceLinks.length ? bug.evidenceLinks : [""]);
  }

  function resetEdit() {
    setActiveBug(null);
    setTitle("");
    setDescription("");
    setReproductionSteps([""]);
    setSeverity("LOW");
    setEvidenceLinks([""]);
  }

  async function saveEdit() {
    if (!user?.minecraftUsername || !activeBug) return;
    setLoading(true);
    setError(null);
    const links = evidenceLinks.map((link) => link.trim()).filter((link) => link.length > 0);
    const cleanedSteps = reproductionSteps.map((step) => step.trim()).filter((step) => step.length > 0);
    try {
      const res = await fetch(`/api/bugs/${activeBug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minecraftIgn: user.minecraftUsername,
          title,
          description,
          reproductionSteps: cleanedSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
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
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/40 bg-[#0f131a]/80 text-white/80 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-black/60 hover:bg-[#171c24] hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
                          onClick={() => startEdit(bug)}
                          aria-label="Edit report"
                          title="Edit"
                        >
                          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                            <path
                              d="M4 13.5V16h2.5l7.4-7.4-2.5-2.5L4 13.5zM13.6 5.4l1 1a1 1 0 001.4 0l.6-.6a1 1 0 000-1.4l-1-1a1 1 0 00-1.4 0l-.6.6a1 1 0 000 1.4z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-400/30 bg-rose-500/10 text-rose-200 shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-rose-400/60 hover:bg-rose-500/20 hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
                          onClick={() => deleteBug(bug.id)}
                          aria-label="Delete report"
                          title="Delete"
                        >
                          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                            <path
                              d="M6 6.5h8m-6 0V5a1 1 0 011-1h2a1 1 0 011 1v1.5m-6 0l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
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
                <div className="mt-2 rounded-xl border border-black/40 bg-[#121722]/80 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Steps</div>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f3a46b]/60 bg-[#f3a46b]/10 text-[#f3a46b] transition hover:border-[#f3a46b] hover:bg-[#f3a46b]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                      onClick={() => setReproductionSteps((prev) => [...prev, ""])}
                      aria-label="Add reproduction step"
                    >
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                        <path
                          d="M10 4v12M4 10h12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3">
                    {reproductionSteps.map((step, index) => (
                      <div key={`repro-step-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0f131a]/80 text-xs font-semibold text-white/60">
                          {index + 1}
                        </div>
                        <input
                          value={step}
                          onChange={(event) => {
                            const value = event.target.value;
                            setReproductionSteps((prev) => prev.map((item, i) => (i === index ? value : item)));
                          }}
                          placeholder={`Step ${index + 1}`}
                          className="w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                        />
                        <div className="flex items-center gap-2">
                          {reproductionSteps.length > 1 && (
                            <button
                              type="button"
                              className="rounded-lg border border-white/10 bg-[#0f131a]/70 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                              onClick={() => setReproductionSteps((prev) => prev.filter((_, i) => i !== index))}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
                  Evidence Links
                </label>
                <div className="mt-2 rounded-xl border border-black/40 bg-[#121722]/80 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Links</div>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f3a46b]/60 bg-[#f3a46b]/10 text-[#f3a46b] transition hover:border-[#f3a46b] hover:bg-[#f3a46b]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                      onClick={() => setEvidenceLinks((prev) => [...prev, ""])}
                      aria-label="Add evidence link"
                    >
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                        <path
                          d="M10 4v12M4 10h12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3">
                    {evidenceLinks.map((link, index) => (
                      <div key={`evidence-link-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          value={link}
                          onChange={(event) => {
                            const value = event.target.value;
                            setEvidenceLinks((prev) => prev.map((item, i) => (i === index ? value : item)));
                          }}
                          placeholder="https://"
                          className="w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                        />
                        <div className="flex items-center gap-2">
                          {evidenceLinks.length > 1 && (
                            <button
                              type="button"
                              className="rounded-lg border border-white/10 bg-[#0f131a]/70 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                              onClick={() => setEvidenceLinks((prev) => prev.filter((_, i) => i !== index))}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
