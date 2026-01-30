import ButtonLink from "@/components/ButtonLink";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <span className="inline-flex items-center rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          Bug bounty program
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">The Camp Bug Hunter</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Report, review, and resolve issues with a clean workflow for The Camp community.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/bugs" variant="primary">View Bugs</ButtonLink>
          <ButtonLink href="/report" variant="secondary">Report a Bug</ButtonLink>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/50 dark:shadow-none">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Track</div>
          <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Structured reports</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Capture steps, severity, and context in one place.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/50 dark:shadow-none">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Prioritize</div>
          <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Clear severity signals</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Focus on the highest impact issues first.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/50 dark:shadow-none">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Resolve</div>
          <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Actionable details</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Keep triage smooth with consistent, readable data.</p>
        </div>
      </section>
    </div>
  );
}
