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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="text-2xl font-semibold text-black dark:text-white">Bug Hunter Form</h2>
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Discord ID</label>
          <input className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Minecraft IGN</label>
          <input className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" value={minecraftIgn} onChange={(e) => setMinecraftIgn(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bug Title</label>
          <input className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bug Description</label>
          <textarea className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bug Reproduction Steps</label>
          <textarea className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" rows={4} value={repro} onChange={(e) => setRepro(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Severity</label>
          <select className="mt-1 w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        <div>
          <button
            className="rounded-md bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
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
