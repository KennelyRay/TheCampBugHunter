import FilterBar from "./_components/FilterBar";
import BugsTable from "./_components/BugsTable";

export const dynamic = "force-dynamic";

export default function BugsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="text-2xl font-semibold text-black dark:text-white">All Reported Bugs</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Filter by status, severity, or Discord ID. Click a row to view details.
      </p>
      <div className="mt-6">
        <FilterBar />
      </div>
      <div className="mt-6">
        <BugsTable />
      </div>
    </div>
  );
}
