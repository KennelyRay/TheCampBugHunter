import Image from "next/image";
import Link from "next/link";
import ButtonLink from "@/components/ButtonLink";
import { BugRepository } from "@/lib/bugRepository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const repo = new BugRepository();
  const bugs = await repo.list();
  const recentBugs = bugs.slice(0, 5);
  const confirmed = bugs.filter((bug) => bug.status === "BUG" || bug.status === "FIXED");
  const reporterMap = new Map<string, { discordId: string; minecraftIgn: string; count: number }>();
  for (const bug of confirmed) {
    const current = reporterMap.get(bug.discordId);
    if (current) {
      reporterMap.set(bug.discordId, { ...current, count: current.count + 1 });
    } else {
      reporterMap.set(bug.discordId, { discordId: bug.discordId, minecraftIgn: bug.minecraftIgn, count: 1 });
    }
  }
  const topReporters = Array.from(reporterMap.values())
    .sort((a, b) => b.count - a.count || a.discordId.localeCompare(b.discordId))
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-black/40 bg-[#151a21]/90 shadow-2xl shadow-black/40">
        <Image src="/LandingPage.png" alt="The Camp world" fill className="object-cover object-center opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"></div>
        <div className="relative z-10 p-8 sm:p-12">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
            The Camp bug bounty
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">The Camp Bug Hunter</h1>
          <p className="mt-3 max-w-2xl text-base text-white/80">
            Report issues fast, track progress, and keep the server experience polished.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/bugs" variant="primary">View Bugs</ButtonLink>
            <ButtonLink href="/report" variant="secondary">Report a Bug</ButtonLink>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-5 text-white shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Recent Bugs</div>
            <Link href="/bugs" className="text-xs font-semibold text-[#f3a46b] hover:text-[#ee9960]">View all</Link>
          </div>
          {recentBugs.length === 0 ? (
            <ul className="mt-4 space-y-3">
              {[1, 2, 3, 4, 5].map((index) => (
                <li key={`recent-placeholder-${index}`} className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-[#141922]/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0f131a] text-xs font-semibold text-white/60">
                      {index}
                    </span>
                    <div className="text-sm text-white/50">Placeholder</div>
                  </div>
                  <div className="text-xs text-white/30">--</div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentBugs.map((bug) => (
                <li key={bug.id} className="flex items-start justify-between gap-3 rounded-xl border border-black/30 bg-[#141922] px-4 py-3">
                  <div>
                    <Link href={`/bugs/${bug.id}`} className="text-sm font-semibold text-white hover:text-[#f3a46b]">
                      {bug.title}
                    </Link>
                    <div className="mt-1 text-xs text-white/60">
                      {bug.discordId} · {bug.severity}
                    </div>
                  </div>
                  <div className="text-xs text-white/50">{new Date(bug.createdAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-5 text-white shadow-lg shadow-black/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Top Confirmed Reporters</div>
          {topReporters.length === 0 ? (
            <ul className="mt-4 space-y-3">
              {[1, 2, 3, 4, 5].map((index) => (
                <li key={`reporter-placeholder-${index}`} className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-[#141922]/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0f131a] text-xs font-semibold text-white/60">
                      {index}
                    </span>
                    <div className="text-sm text-white/50">Placeholder</div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/40">
                    --
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-4 space-y-3">
              {topReporters.map((reporter) => (
                <li key={reporter.discordId} className="flex items-center justify-between rounded-xl border border-black/30 bg-[#141922] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={`https://minotar.net/helm/${encodeURIComponent(reporter.minecraftIgn)}/32`}
                      alt={`${reporter.minecraftIgn} skin`}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border border-black/40 bg-[#0f131a]"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">{reporter.minecraftIgn}</div>
                      <div className="mt-1 text-xs text-white/60">{reporter.discordId}</div>
                    </div>
                  </div>
                  <div className="rounded-full border border-[#f3a46b]/40 bg-[#f3a46b]/10 px-3 py-1 text-xs font-semibold text-[#f3a46b]">
                    {reporter.count}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
