"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Reward } from "@/types/reward";

type CampUser = { minecraftUsername?: string };

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-black/40 bg-[#151a21]/90 shadow-2xl shadow-black/40">
        <Image src="/rewardsbanner.png" alt="Bug rewards" fill className="object-cover object-center opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"></div>
        <div className="relative z-10 p-8 sm:p-12">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
            The Camp rewards
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Bug Rewards</h1>
          <p className="mt-3 max-w-2xl text-base text-white/80">
            Earn reward coins when your reports get fixed and redeem them for in-game perks.
          </p>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-5 text-white shadow-lg shadow-black/20 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">How it works</div>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="rounded-xl border border-black/30 bg-[#141922] px-4 py-3">
              Submit bug reports and help the team confirm real issues.
            </li>
            <li className="rounded-xl border border-black/30 bg-[#141922] px-4 py-3">
              When a report is marked as fixed, you gain 1 reward coin.
            </li>
            <li className="rounded-xl border border-black/30 bg-[#141922] px-4 py-3">
              Spend reward coins to redeem in-game rewards below.
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-5 text-white shadow-lg shadow-black/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Your balance</div>
          <div className="mt-4 flex items-center gap-3">
            <Image src="/RewardCoinIcon.png" alt="Reward coin" width={36} height={36} className="h-9 w-9" />
            <div>
              <div className="text-2xl font-semibold">
                {balance ?? 0}
              </div>
              <div className="text-xs text-white/60">
                {username ? username : "Sign in to track coins"}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-5 text-white shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Rewards</div>
          {loading && <span className="text-xs text-white/50">Loading...</span>}
        </div>
        {error && <div className="mt-4 text-sm text-rose-300">{error}</div>}
        {!loading && !error && rewards.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-[#141922]/70 px-4 py-6 text-sm text-white/60">
            No rewards available yet.
          </div>
        )}
        {!loading && !error && rewards.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="rounded-xl border border-black/30 bg-[#141922] p-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={reward.iconUrl}
                    alt={reward.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-lg border border-white/10 bg-[#0f131a] object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">{reward.name}</div>
                    <div className="text-xs text-white/60">{reward.cost} coins</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/70">{reward.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
