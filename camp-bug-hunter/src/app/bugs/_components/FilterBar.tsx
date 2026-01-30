"use client";
import { useState } from "react";

export default function FilterBar() {
  const [status, setStatus] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
        <select
          className="mt-1 w-48 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="BUG">Bug</option>
          <option value="NOT_A_BUG">Not a Bug</option>
          <option value="FIXED">Fixed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Severity</label>
        <select
          className="mt-1 w-48 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="">All</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Discord ID</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
          placeholder="e.g. 123456789"
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          onClick={() => {
            const params = new URLSearchParams();
            if (status) params.set("status", status);
            if (severity) params.set("severity", severity);
            if (discordId) params.set("discordId", discordId);
            const event = new CustomEvent("bugs:filters", { detail: params.toString() });
            window.dispatchEvent(event);
          }}
        >
          Apply Filters
        </button>
        <button
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
          onClick={() => {
            setStatus("");
            setSeverity("");
            setDiscordId("");
            window.dispatchEvent(new CustomEvent("bugs:filters", { detail: "" }));
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
