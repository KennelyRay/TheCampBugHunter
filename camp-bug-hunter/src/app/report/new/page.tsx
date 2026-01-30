"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Severity } from "@/types/bug";

export default function NewReportPage() {
  const router = useRouter();
  const [discordId, setDiscordId] = useState("");
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repro, setRepro] = useState("");
  const [severity, setSeverity] = useState<Severity>("LOW");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordId,
          minecraftIgn,
          title,
          description,
          reproductionSteps: repro,
          severity,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      router.push("/report/success");
    } catch {
      setError("Submission failed. Ensure database is configured.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Bug Hunter Form</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Provide the details below so we can reproduce the issue quickly.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Discord ID</label>
            <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Minecraft IGN</label>
            <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" value={minecraftIgn} onChange={(e) => setMinecraftIgn(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Bug Title</label>
            <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Bug Description</label>
            <textarea className="mt-1 w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Bug Reproduction Steps</label>
            <textarea className="mt-1 w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" rows={4} value={repro} onChange={(e) => setRepro(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Severity</label>
            <select className="mt-1 w-48 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p>}
        <div className="mt-6">
          <button
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? "Submitting..." : "Submit Bug Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
