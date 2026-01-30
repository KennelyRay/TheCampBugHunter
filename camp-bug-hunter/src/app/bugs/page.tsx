import FilterBar from "./_components/FilterBar";
import BugsTable from "./_components/BugsTable";

export const dynamic = "force-dynamic";

export default function BugsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">All Reported Bugs</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Filter by status, severity, or Discord ID. Click a row to view details.
        </p>
        <div className="mt-4">
          <FilterBar />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <BugsTable />
      </div>
    </div>
  );
}
