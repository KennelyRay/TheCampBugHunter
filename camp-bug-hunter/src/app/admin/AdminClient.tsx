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

type Reward = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  command: string;
  cost: number;
  active: boolean;
};

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
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [rewardIconUrl, setRewardIconUrl] = useState("");
  const [rewardIconName, setRewardIconName] = useState("No file chosen");
  const [rewardCommand, setRewardCommand] = useState("");
  const [iconUploadKey, setIconUploadKey] = useState(0);
  const [rewardPending, setRewardPending] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsError, setRewardsError] = useState<string | null>(null);
  const [editReward, setEditReward] = useState<Reward | null>(null);
  const [editRewardName, setEditRewardName] = useState("");
  const [editRewardCost, setEditRewardCost] = useState("");
  const [editRewardDescription, setEditRewardDescription] = useState("");
  const [editRewardIconUrl, setEditRewardIconUrl] = useState("");
  const [editRewardIconName, setEditRewardIconName] = useState("No file chosen");
  const [editRewardCommand, setEditRewardCommand] = useState("");
  const [editIconUploadKey, setEditIconUploadKey] = useState(0);
  const [editRewardPending, setEditRewardPending] = useState(false);
  const [rewardDeleteTarget, setRewardDeleteTarget] = useState<Reward | null>(null);
  const [rewardDeletePending, setRewardDeletePending] = useState(false);
  const [coinPending, setCoinPending] = useState(false);
  const [coinMessage, setCoinMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bugs" | "rewards">("bugs");
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<{ id: string; minecraftUsername: string; email: string; rewardBalance: number }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string; minecraftUsername: string; email: string; rewardBalance: number } | null>(null);
  const [coinChangeAmount, setCoinChangeAmount] = useState("");

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

  const loadRewards = useCallback(async () => {
    setRewardsLoading(true);
    try {
      const res = await fetch("/api/rewards?includeInactive=true");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as Reward[];
      setRewards(data);
      setRewardsError(null);
    } catch {
      setRewardsError("Unable to load rewards.");
    } finally {
      setRewardsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "rewards") return;
    let mounted = true;
    const controller = new AbortController();
    async function loadUsers() {
      setUsersLoading(true);
      try {
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userSearch.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as { id: string; minecraftUsername: string; email: string; rewardBalance: number }[];
        if (mounted) {
          setUsers(data);
          setUsersError(null);
        }
      } catch {
        if (mounted) setUsersError("Unable to load users.");
      } finally {
        if (mounted) setUsersLoading(false);
      }
    }
    loadUsers();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [activeTab, userSearch]);

  useEffect(() => {
    if (activeTab !== "rewards") return;
    void loadRewards();
  }, [activeTab, loadRewards]);

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

  async function createReward() {
    if (rewardPending) return;
    const cost = Number(rewardCost);
    if (!rewardName.trim() || !rewardDescription.trim() || !rewardIconUrl.trim() || !rewardCommand.trim() || !Number.isFinite(cost) || cost <= 0) {
      setRewardMessage("Enter name, description, icon, command, and positive cost.");
      return;
    }
    setRewardPending(true);
    setRewardMessage(null);
    const res = await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: rewardName.trim(),
        description: rewardDescription.trim(),
        iconUrl: rewardIconUrl.trim(),
        command: rewardCommand.trim(),
        cost,
      }),
    });
    if (res.ok) {
      const created = (await res.json()) as Reward;
      setRewardName("");
      setRewardDescription("");
      setRewardIconUrl("");
      setRewardIconName("No file chosen");
      setRewardCost("");
      setRewardCommand("");
      setIconUploadKey((prev) => prev + 1);
      setRewards((prev) => [...prev, created].sort((a, b) => a.cost - b.cost));
      setRewardMessage("Reward created.");
    } else {
      setRewardMessage("Failed to create reward.");
    }
    setRewardPending(false);
  }

  function handleIconUpload(file: File | null) {
    if (!file) {
      setRewardIconUrl("");
      setRewardIconName("No file chosen");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setRewardMessage("Upload a valid image file.");
      setIconUploadKey((prev) => prev + 1);
      setRewardIconName("No file chosen");
      return;
    }
    setRewardMessage(null);
    setRewardIconName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        setRewardIconUrl(result);
      } else {
        setRewardMessage("Failed to read image.");
      }
    };
    reader.onerror = () => {
      setRewardMessage("Failed to read image.");
    };
    reader.readAsDataURL(file);
  }

  function handleEditIconUpload(file: File | null) {
    if (!file) {
      setEditRewardIconUrl("");
      setEditRewardIconName("No file chosen");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setRewardMessage("Upload a valid image file.");
      setEditIconUploadKey((prev) => prev + 1);
      setEditRewardIconName("No file chosen");
      return;
    }
    setRewardMessage(null);
    setEditRewardIconName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        setEditRewardIconUrl(result);
      } else {
        setRewardMessage("Failed to read image.");
      }
    };
    reader.onerror = () => {
      setRewardMessage("Failed to read image.");
    };
    reader.readAsDataURL(file);
  }

  function startEditReward(reward: Reward) {
    setEditReward(reward);
    setEditRewardName(reward.name);
    setEditRewardDescription(reward.description);
    setEditRewardCost(String(reward.cost));
    setEditRewardIconUrl(reward.iconUrl);
    setEditRewardIconName("Current icon");
    setEditRewardCommand(reward.command || "");
    setEditIconUploadKey((prev) => prev + 1);
    setRewardMessage(null);
  }

  async function saveRewardEdits() {
    if (!editReward || editRewardPending) return;
    const cost = Number(editRewardCost);
    if (
      !editRewardName.trim() ||
      !editRewardDescription.trim() ||
      !editRewardIconUrl.trim() ||
      !editRewardCommand.trim() ||
      !Number.isFinite(cost) ||
      cost <= 0
    ) {
      setRewardMessage("Enter name, description, icon, command, and positive cost.");
      return;
    }
    setEditRewardPending(true);
    const res = await fetch("/api/rewards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editReward.id,
        name: editRewardName.trim(),
        description: editRewardDescription.trim(),
        iconUrl: editRewardIconUrl.trim(),
        command: editRewardCommand.trim(),
        cost,
      }),
    });
    if (res.ok) {
      const updated = (await res.json()) as Reward;
      setRewards((prev) => prev.map((reward) => (reward.id === updated.id ? updated : reward)).sort((a, b) => a.cost - b.cost));
      setRewardMessage("Reward updated.");
      setEditReward(null);
    } else {
      setRewardMessage("Failed to update reward.");
    }
    setEditRewardPending(false);
  }

  async function deleteReward(id: string) {
    const res = await fetch("/api/rewards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRewards((prev) => prev.filter((reward) => reward.id !== id));
      setRewardMessage("Reward deleted.");
    } else {
      setRewardMessage("Failed to delete reward.");
    }
  }

  async function confirmRewardDelete() {
    if (!rewardDeleteTarget || rewardDeletePending) return;
    setRewardDeletePending(true);
    await deleteReward(rewardDeleteTarget.id);
    setRewardDeletePending(false);
    setRewardDeleteTarget(null);
  }

  async function updateCoins(direction: "add" | "remove") {
    if (coinPending || !selectedUser) return;
    const amountValue = Number(coinChangeAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setCoinMessage("Enter a positive amount.");
      return;
    }
    const amount = direction === "remove" ? -amountValue : amountValue;
    setCoinPending(true);
    setCoinMessage(null);
    const res = await fetch("/api/rewards/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minecraftUsername: selectedUser.minecraftUsername, amount }),
    });
    if (res.ok) {
      const data = (await res.json()) as { balance: number };
      setCoinChangeAmount("");
      setCoinMessage(direction === "remove" ? "Coins removed." : "Coins added.");
      setUsers((prev) =>
        prev.map((user) =>
          user.minecraftUsername === selectedUser.minecraftUsername
            ? { ...user, rewardBalance: data.balance }
            : user
        )
      );
      setSelectedUser(null);
    } else {
      setCoinMessage("Failed to update coins.");
    }
    setCoinPending(false);
  }

  return (
    <div className="space-y-6">
      {statusToast && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 shadow-lg shadow-black/20">
          {statusToast}
        </div>
      )}
      {rewardMessage && (
        <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100 shadow-lg shadow-black/20">
          {rewardMessage}
        </div>
      )}
      {coinMessage && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 shadow-lg shadow-black/20">
          {coinMessage}
        </div>
      )}
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <div>
          <h2 className="text-2xl font-semibold text-white">Admin Dashboard</h2>
          <p className="mt-1 text-sm text-white/70">Review reports, filter quickly, and update statuses.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              activeTab === "bugs"
                ? "border-[#f3a46b]/60 bg-[#f3a46b]/10 text-[#f3a46b]"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
            }`}
            onClick={() => setActiveTab("bugs")}
            type="button"
          >
            Reports
          </button>
          <button
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              activeTab === "rewards"
                ? "border-[#f3a46b]/60 bg-[#f3a46b]/10 text-[#f3a46b]"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
            }`}
            onClick={() => setActiveTab("rewards")}
            type="button"
          >
            Rewards
          </button>
        </div>
        {activeTab === "bugs" && (
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
        )}
      </div>
      {activeTab === "bugs" && (
        <>
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
                  {bugs.map((b) => {
                    const skinName = b.minecraftIgn?.trim() ? b.minecraftIgn : "Steve";
                    const avatarUrl = `https://minotar.net/helm/${encodeURIComponent(skinName)}/32.png`;
                    return (
                      <tr key={b.id} className="odd:bg-[#131821] hover:bg-[#1a202a]">
                        <td className="border-b border-black/30 px-4 py-3 text-sm text-white/90">
                          <div className="flex items-center gap-3">
                            <Image
                              src={avatarUrl}
                              alt={`${skinName} skin`}
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-md border border-white/10 bg-[#0f131a]/80"
                            />
                            <span>{b.minecraftIgn} • {b.discordId}</span>
                          </div>
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
                              href={`/admin/bugs/${b.id}`}
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
                              Status
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
                    );
                  })}
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
        </>
      )}
      {activeTab === "rewards" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-5 text-white shadow-lg shadow-black/30">
            <div className="text-sm font-semibold text-white">Reward Adder</div>
            <div className="mt-3 grid gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Cost</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                    value={rewardCost}
                    onChange={(e) => setRewardCost(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Icon</label>
                  <input
                    key={iconUploadKey}
                    id="reward-icon-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleIconUpload(e.target.files?.[0] ?? null)}
                  />
                  <label
                    htmlFor="reward-icon-upload"
                    className="mt-1 flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/80 shadow-sm transition hover:border-black/60 hover:bg-[#171c24]"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-[#f3a46b]">
                        <path
                          d="M10 3.5v8m0-8l-3 3m3-3l3 3M4 12.5v3a1 1 0 001 1h10a1 1 0 001-1v-3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Upload
                    </span>
                    <span className="text-xs text-white/70">{rewardIconName}</span>
                  </label>
                  {rewardIconUrl && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2">
                      <Image
                        src={rewardIconUrl}
                        alt="Reward icon preview"
                        width={36}
                        height={36}
                        unoptimized
                        className="h-9 w-9 rounded-lg border border-white/10 object-cover"
                      />
                      <span className="text-xs text-white/60">Preview</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Description</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                  rows={3}
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Command</label>
                <input
                  className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                  value={rewardCommand}
                  onChange={(e) => setRewardCommand(e.target.value)}
                />
              </div>
              <button
                className={`w-fit rounded-lg px-4 py-2 text-sm font-semibold shadow-lg transition-all duration-200 ease-out ${
                  rewardPending
                    ? "cursor-not-allowed bg-[#f3a46b]/40 text-[#1f1a16]/60 shadow-none"
                    : "bg-[#f3a46b] text-[#1f1a16] shadow-[#f3a46b]/30 hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-[#f3a46b]/40"
                }`}
                onClick={createReward}
                disabled={rewardPending}
              >
                {rewardPending ? "Creating..." : "Create Reward"}
              </button>
              </div>
            </div>
            <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-5 text-white shadow-lg shadow-black/30">
              <div className="text-sm font-semibold text-white">Registered Users</div>
              <div className="mt-3">
                <input
                  className="w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                  placeholder="Search by username or email"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="mt-4 space-y-2">
                {usersLoading && <div className="text-xs text-white/50">Loading users...</div>}
                {usersError && <div className="text-xs text-rose-300">{usersError}</div>}
                {!usersLoading && !usersError && users.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#141922]/70 px-4 py-3 text-xs text-white/60">
                    No users found.
                  </div>
                )}
                {!usersLoading && !usersError && users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-black/40 bg-[#141922] px-3 py-2 text-left text-sm text-white/80 transition hover:border-black/60 hover:bg-[#1a202a]"
                    onClick={() => {
                      setSelectedUser(user);
                      setCoinMessage(null);
                      setCoinChangeAmount("");
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={`https://minotar.net/helm/${encodeURIComponent(user.minecraftUsername || "Steve")}/32.png`}
                        alt={`${user.minecraftUsername} skin`}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-md border border-white/10 bg-[#0f131a]/80"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">{user.minecraftUsername}</div>
                        <div className="text-xs text-white/60">{user.email}</div>
                      </div>
                    </div>
                    <div className="rounded-full border border-[#f3a46b]/40 bg-[#f3a46b]/10 px-3 py-1 text-xs font-semibold text-[#f3a46b]">
                      {user.rewardBalance}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-5 text-white shadow-lg shadow-black/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">Rewards</div>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                onClick={loadRewards}
                disabled={rewardsLoading}
              >
                {rewardsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {rewardsLoading && <div className="text-xs text-white/50">Loading rewards...</div>}
              {rewardsError && <div className="text-xs text-rose-300">{rewardsError}</div>}
              {!rewardsLoading && !rewardsError && rewards.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#141922]/70 px-4 py-3 text-xs text-white/60">
                  No rewards found.
                </div>
              )}
              {!rewardsLoading && !rewardsError && rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/40 bg-[#141922] px-3 py-3 text-sm text-white/80"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={reward.iconUrl}
                      alt={`${reward.name} icon`}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">{reward.name}</div>
                      <div className="text-xs text-white/60">{reward.description}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-[#f3a46b]/40 bg-[#f3a46b]/10 px-3 py-1 text-xs font-semibold text-[#f3a46b]">
                      {reward.cost} coins
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                      onClick={() => startEditReward(reward)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200 transition hover:border-red-400/70 hover:bg-red-500/20"
                      onClick={() => setRewardDeleteTarget(reward)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {editReward && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center bg-black/60 px-4 py-6 sm:items-center">
            <div className="w-full max-w-md rounded-2xl border border-black/40 bg-[#151a21]/95 p-5 text-white shadow-2xl shadow-black/60 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Edit Reward</div>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                  onClick={() => setEditReward(null)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Name</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                    value={editRewardName}
                    onChange={(e) => setEditRewardName(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Cost</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                      value={editRewardCost}
                      onChange={(e) => setEditRewardCost(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Icon</label>
                    <input
                      key={editIconUploadKey}
                      id="reward-edit-icon-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleEditIconUpload(e.target.files?.[0] ?? null)}
                    />
                    <label
                      htmlFor="reward-edit-icon-upload"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/80 shadow-sm transition hover:border-black/60 hover:bg-[#171c24]"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-[#f3a46b]">
                          <path
                            d="M10 3.5v8m0-8l-3 3m3-3l3 3M4 12.5v3a1 1 0 001 1h10a1 1 0 001-1v-3"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Upload
                      </span>
                      <span className="text-xs text-white/70">{editRewardIconName}</span>
                    </label>
                    {editRewardIconUrl && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2">
                        <Image
                          src={editRewardIconUrl}
                          alt="Reward icon preview"
                          width={36}
                          height={36}
                          unoptimized
                          className="h-9 w-9 rounded-lg border border-white/10 object-cover"
                        />
                        <span className="text-xs text-white/60">Preview</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Description</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                    rows={3}
                    value={editRewardDescription}
                    onChange={(e) => setEditRewardDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Reward Command</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                    value={editRewardCommand}
                    onChange={(e) => setEditRewardCommand(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                    onClick={() => setEditReward(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg px-5 py-2 text-xs font-semibold shadow-lg transition-all duration-200 ease-out ${
                      editRewardPending
                        ? "cursor-not-allowed bg-[#f3a46b]/40 text-[#1f1a16]/60 shadow-none"
                        : "bg-[#f3a46b] text-[#1f1a16] shadow-[#f3a46b]/30 hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-[#f3a46b]/40"
                    }`}
                    onClick={saveRewardEdits}
                    disabled={editRewardPending}
                  >
                    {editRewardPending ? "Saving..." : "Save Reward"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {rewardDeleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center bg-black/60 px-4 py-6 sm:items-center">
            <div className="w-full max-w-md rounded-2xl border border-black/40 bg-[#151a21]/95 p-5 text-white shadow-2xl shadow-black/60 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-rose-300/80">Confirm Delete</div>
              <div className="mt-2 text-sm text-white/70">
                Delete <span className="font-semibold text-white">{rewardDeleteTarget.name}</span>? This cannot be undone.
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                  onClick={() => setRewardDeleteTarget(null)}
                  disabled={rewardDeletePending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-5 py-2 text-xs font-semibold shadow-lg transition-all duration-200 ease-out ${
                    rewardDeletePending
                      ? "cursor-not-allowed bg-red-500/40 text-red-100/60 shadow-none"
                      : "bg-red-500/80 text-white shadow-red-500/30 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-500/40"
                  }`}
                  onClick={confirmRewardDelete}
                  disabled={rewardDeletePending}
                >
                  {rewardDeletePending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center bg-black/60 px-4 py-6 sm:items-center">
            <div className="w-full max-w-md rounded-2xl border border-black/40 bg-[#151a21]/95 p-5 text-white shadow-2xl shadow-black/60 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Reward Coins</div>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Image
                  src={`https://minotar.net/helm/${encodeURIComponent(selectedUser.minecraftUsername || "Steve")}/32.png`}
                  alt={`${selectedUser.minecraftUsername} skin`}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg border border-white/10 bg-[#0f131a]/80"
                />
                <div>
                  <div className="text-sm font-semibold text-white">{selectedUser.minecraftUsername}</div>
                  <div className="text-xs text-white/60">{selectedUser.email}</div>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-black/40 bg-[#0f131a]/70 px-4 py-3 text-sm text-white/70">
                Current balance: <span className="font-semibold text-white">{selectedUser.rewardBalance}</span>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Change Amount</label>
                <input
                  className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                  value={coinChangeAmount}
                  onChange={(e) => setCoinChangeAmount(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              {coinMessage && <div className="mt-3 text-xs text-white/70">{coinMessage}</div>}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-lg transition-all duration-200 ease-out ${
                    coinPending
                      ? "cursor-not-allowed bg-[#f3a46b]/40 text-[#1f1a16]/60 shadow-none"
                      : "bg-[#f3a46b] text-[#1f1a16] shadow-[#f3a46b]/30 hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-[#f3a46b]/40"
                  }`}
                  onClick={() => updateCoins("add")}
                  disabled={coinPending}
                >
                  {coinPending ? "Saving..." : "Add Coins"}
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-lg transition-all duration-200 ease-out ${
                    coinPending
                      ? "cursor-not-allowed bg-red-500/30 text-red-100/70 shadow-none"
                      : "bg-red-500/80 text-white shadow-red-500/30 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-500/40"
                  }`}
                  onClick={() => updateCoins("remove")}
                  disabled={coinPending}
                >
                  Remove Coins
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
