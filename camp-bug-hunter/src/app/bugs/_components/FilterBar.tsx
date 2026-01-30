"use client";
import { useState } from "react";

export default function FilterBar() {
  const [status, setStatus] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
        <select
          className="mt-1 w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
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
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Severity</label>
        <select
          className="mt-1 w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
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
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Discord ID</label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          placeholder="e.g. 123456789"
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
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
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
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
