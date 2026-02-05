import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import ButtonLink from "@/components/ButtonLink";
import { BugRepository } from "@/lib/bugRepository";
import { adminSessionCookieName, getAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const adminSession = getAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  const viewBugsHref = adminSession ? "/admin" : "/bugs";
  const repo = new BugRepository();
  const bugs = await repo.list();
  const recentBugs = bugs.slice(0, 5);
  const reporterMap = new Map<string, { discordId: string; minecraftIgn: string; count: number }>();
  for (const bug of bugs) {
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
  const fixedCount = bugs.filter((bug) => bug.status === "FIXED").length;
  const openCount = bugs.filter((bug) => bug.status !== "FIXED" && bug.status !== "NOT_A_BUG").length;

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[32px] border border-black/40 bg-[#12161d]/95 shadow-2xl shadow-black/50">
        <Image src="/LandingPage.png" alt="The Camp world" fill className="object-cover object-center opacity-70" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-transparent"></div>
        <div className="relative z-10 grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              The Camp bug bounty
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              The Camp Bug Hunter
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/80">
              Built for bug reporting only, with clean tracking, organized triage, and reward points for confirmed fixes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={viewBugsHref} variant="primary">View Bugs</ButtonLink>
              <ButtonLink href="/report" variant="secondary">Report a Bug</ButtonLink>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Total reports", value: bugs.length },
              { label: "Open", value: openCount },
              { label: "Fixed", value: fixedCount },
              { label: "Top hunters", value: topReporters.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 text-white shadow-lg shadow-black/40"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
                <div className="relative">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">{stat.label}</div>
                  <div className="mt-3 text-3xl font-semibold">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/30 bg-[#151a21]/95 p-6 text-white shadow-lg shadow-black/30 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Why report here</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/30 bg-[#121821] p-4">
              <div className="text-sm font-semibold text-white">Focused on Bugs</div>
              <div className="mt-2 text-sm text-white/65">
                Unlike the Discord ticket system for all questions, this site focuses solely on bug reports.
              </div>
            </div>
            <div className="rounded-2xl border border-black/30 bg-[#121821] p-4">
              <div className="text-sm font-semibold text-white">Organized</div>
              <div className="mt-2 text-sm text-white/65">
                Every bug stays tracked so it never gets lost or overshadowed by other reports.
              </div>
            </div>
            <div className="rounded-2xl border border-black/30 bg-[#121821] p-4">
              <div className="text-sm font-semibold text-white">Earn Rewards</div>
              <div className="mt-2 text-sm text-white/65">
                For every fixed bug you reported, earn 1 reward point to exchange for in-game rewards.
              </div>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-black/40 bg-[#151a21]/90 shadow-lg shadow-black/30">
          <Image src="/rewardsbanner.png" alt="Bug rewards" fill className="object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent"></div>
          <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-6 text-white">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Bug Rewards</div>
              <div className="mt-2 text-2xl font-semibold">Earn reward coins</div>
              <div className="mt-2 text-sm text-white/70">Fixes earn coins. Redeem them for in-game rewards.</div>
            </div>
            <div>
              <ButtonLink href="/rewards" variant="primary">View Rewards</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-6 text-white shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Recent Bugs</div>
            <Link href={viewBugsHref} className="text-xs font-semibold text-[#f3a46b] hover:text-[#ee9960]">
              View all
            </Link>
          </div>
          {recentBugs.length === 0 ? (
            <ul className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <li key={`recent-placeholder-${index}`} className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-[#141922]/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0f131a] text-[10px] font-semibold text-white/60">
                      --
                    </div>
                    <div className="text-sm text-white/50">No bugs found</div>
                  </div>
                  <div className="text-xs text-white/30">--</div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-5 space-y-3">
              {recentBugs.map((bug) => (
                <li key={bug.id} className="flex items-start justify-between gap-3 rounded-xl border border-black/30 bg-[#141922] px-4 py-3">
                  <div>
                    <span className="text-sm font-semibold text-white">{bug.title}</span>
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
        <div className="rounded-2xl border border-black/30 bg-[#1a1f26]/90 p-6 text-white shadow-lg shadow-black/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Top Reporters</div>
          {topReporters.length === 0 ? (
            <ul className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <li key={`reporter-placeholder-${index}`} className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-[#141922]/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0f131a] text-[10px] font-semibold text-white/60">
                      --
                    </div>
                    <div className="text-sm text-white/50">Hunter</div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/40">
                    --
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-5 space-y-3">
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
      <section className="rounded-3xl border border-black/40 bg-[#151a21]/90 p-8 text-white shadow-lg shadow-black/30 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Ready to report?</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Keep the server polished together</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Submit issues with steps and evidence, then track progress from triage to fix.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/report" variant="primary">Report a Bug</ButtonLink>
            <ButtonLink href={viewBugsHref} variant="secondary">Browse Reports</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
