"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Reward } from "@/types/reward";

type CampUser = { minecraftUsername?: string };

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemPendingId, setRedeemPendingId] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const username = useMemo(() => {
    if (typeof window === "undefined") return "";
    const raw = window.localStorage.getItem("campUser");
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw) as CampUser;
      return parsed.minecraftUsername?.trim() ?? "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadRewards() {
      try {
        const res = await fetch("/api/rewards");
        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as Reward[];
        if (mounted) {
          setRewards(data);
          setError(null);
        }
      } catch {
        if (mounted) setError("Rewards are not available yet.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadRewards();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!username) return;
    let mounted = true;
    async function loadBalance() {
      const res = await fetch(`/api/rewards/balance?minecraftUsername=${encodeURIComponent(username)}`);
      if (!mounted) return;
      if (res.ok) {
        const data = (await res.json()) as { balance: number };
        setBalance(data.balance);
      } else {
        setBalance(0);
      }
    }
    loadBalance();
    return () => {
      mounted = false;
    };
  }, [username]);

  async function handleRedeem(reward: Reward) {
    if (!username) {
      setModalMessage("Sign in to redeem rewards.");
      return;
    }
    if (balance !== null && balance < reward.cost) {
      setModalMessage("You don't have enough reward coins.");
      return;
    }
    if (redeemPendingId) return;
    setRedeemPendingId(reward.id);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id, minecraftUsername: username }),
      });
      if (res.ok) {
        const data = (await res.json()) as { balance: number };
        setBalance(data.balance);
      } else if (res.status === 409) {
        setModalMessage("You don't have enough reward coins.");
      } else {
        setModalMessage("Unable to redeem this reward right now.");
      }
    } catch {
      setModalMessage("Unable to redeem this reward right now.");
    } finally {
      setRedeemPendingId(null);
    }
  }

  return (
    <div className="space-y-10">
      {modalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141922]/95 p-6 text-white shadow-2xl shadow-black/50">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f3a46b]/90">Reward Notice</div>
            <div className="mt-3 text-sm text-white/80">{modalMessage}</div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-[#0f131a]/70 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                onClick={() => setModalMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
            <path
              d="M12.5 4.5L7.5 10l5 5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-[32px] border border-black/40 bg-[#12161d]/95 shadow-2xl shadow-black/50">
        <Image src="/rewardsbanner.png" alt="Bug rewards" fill className="object-cover object-center opacity-70" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-transparent"></div>
        <div className="relative z-10 grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              The Camp rewards
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Bug Rewards</h1>
            <p className="mt-4 max-w-2xl text-base text-white/80">
              Earn reward coins when your reports get fixed and redeem them for in-game perks.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-white shadow-lg shadow-black/40">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Your balance</div>
            <div className="mt-4 flex items-center gap-3">
              <Image src="/RewardCoinIcon.png" alt="Reward coin" width={36} height={36} className="h-9 w-9" />
              <div>
                <div className="text-3xl font-semibold">{balance ?? 0}</div>
                <div className="text-xs text-white/60">{username ? username : "Sign in to track coins"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-6 text-white shadow-lg shadow-black/20 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">How it works</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/30 bg-[#141922] p-4">
              <div className="text-sm font-semibold text-white">Report</div>
              <div className="mt-2 text-sm text-white/65">Submit bug reports and help the team confirm real issues.</div>
            </div>
            <div className="rounded-2xl border border-black/30 bg-[#141922] p-4">
              <div className="text-sm font-semibold text-white">Fix</div>
              <div className="mt-2 text-sm text-white/65">When a report is marked as fixed, you gain 1 reward coin.</div>
            </div>
            <div className="rounded-2xl border border-black/30 bg-[#141922] p-4">
              <div className="text-sm font-semibold text-white">Redeem</div>
              <div className="mt-2 text-sm text-white/65">Spend reward coins to redeem in-game rewards.</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-6 text-white shadow-lg shadow-black/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Rewards at a glance</div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-black/30 bg-[#141922] px-4 py-3 text-sm text-white/70">
              Each fixed report earns 1 coin.
            </div>
            <div className="rounded-xl border border-black/30 bg-[#141922] px-4 py-3 text-sm text-white/70">
              Coins never expire.
            </div>
            <div className="rounded-xl border border-black/30 bg-[#141922] px-4 py-3 text-sm text-white/70">
              Redeem coins in the rewards list below.
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-black/30 bg-gradient-to-br from-[#1a1f26]/95 via-[#151b23]/95 to-[#11161d]/95 p-6 text-white shadow-2xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Rewards</div>
            <div className="mt-1 text-sm text-white/70">Redeem coins for in-game perks.</div>
          </div>
          {loading && <span className="text-xs text-white/50">Loading...</span>}
        </div>
        {error && <div className="mt-4 text-sm text-rose-300">{error}</div>}
        {!loading && !error && rewards.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-[#141922]/70 px-4 py-6 text-sm text-white/60">
            No rewards available yet.
          </div>
        )}
        {!loading && !error && rewards.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="group rounded-2xl border border-black/30 bg-[#141922]/90 p-5 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-black/40 hover:bg-[#151c25]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={reward.iconUrl}
                      alt={reward.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-xl border border-white/10 bg-[#0f131a] object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">{reward.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                        <span className="text-base font-semibold text-white">{reward.cost}</span>
                        <Image
                          src="/RewardCoinIcon.png"
                          alt="Reward coin"
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    Reward
                  </div>
                </div>
                <p
                  className="mt-3 text-sm text-white/70"
                  style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {reward.description}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-xs text-white/50">{username ? "Ready to redeem" : "Sign in to redeem"}</div>
                  <button
                    type="button"
                    className="rounded-lg bg-[#f3a46b] px-4 py-2 text-xs font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleRedeem(reward)}
                    disabled={redeemPendingId === reward.id}
                  >
                    {redeemPendingId === reward.id ? "Redeeming..." : "Redeem"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
