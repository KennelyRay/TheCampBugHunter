import Image from "next/image";
import { BugRepository } from "@/lib/bugRepository";
import type { Bug } from "@/types/bug";

export const dynamic = "force-dynamic";

async function getBug(id: string): Promise<Bug | null> {
  const repo = new BugRepository();
  return repo.get(id);
}

export default async function BugPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bug = await getBug(id);
  if (!bug) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Bug Not Found</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">The bug might not exist or the database is not configured.</p>
      </div>
    );
  }

  const severityMeta: Record<Bug["severity"], { label: string; icon: string }> = {
    LOW: { label: "Low", icon: "/Low.svg" },
    MEDIUM: { label: "Medium", icon: "/Medium.svg" },
    HIGH: { label: "High", icon: "/High.svg" },
    URGENT: { label: "Urgent", icon: "/Urgent.svg" },
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{bug.title}</h2>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {bug.status.replaceAll("_", " ")}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span>Severity:</span>
          <Image src={severityMeta[bug.severity].icon} alt="" width={16} height={16} className="h-4 w-4" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">{severityMeta[bug.severity].label}</span>
        </div>
      </div>
      <div className="grid gap-4">
        <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{bug.description}</p>
        </section>
        <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reproduction Steps</h3>
          <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{bug.reproductionSteps}</p>
        </section>
        <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600 shadow-sm shadow-slate-200/50 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300 dark:shadow-none">
          Reported by Discord ID {bug.discordId} as Minecraft IGN {bug.minecraftIgn}
        </section>
      </div>
    </div>
  );
}
