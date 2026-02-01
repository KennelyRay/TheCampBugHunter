"use client";
import { useState } from "react";

export default function FilterBar() {
  const [status, setStatus] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div>
        <label className="block text-sm font-medium text-white/80">Status</label>
        <select
          className="mt-1 w-48 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
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
        <label className="block text-sm font-medium text-white/80">Severity</label>
        <select
          className="mt-1 w-48 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
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
          className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
          placeholder="e.g. 123456789"
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-[#f3a46b] px-4 py-2 text-sm font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
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
          className="rounded-lg border border-[#f3a46b]/60 bg-transparent px-4 py-2 text-sm font-semibold text-[#f3a46b] shadow-sm transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:border-[#f3a46b] hover:bg-[#f3a46b]/10 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
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
