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
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="text-xl font-semibold text-black dark:text-white">Bug Not Found</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">The bug might not exist or the database is not configured.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="text-2xl font-semibold text-black dark:text-white">{bug.title}</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Severity: {bug.severity} • Status: {bug.status.replaceAll("_"," ")}
      </p>
      <div className="mt-6 space-y-4">
        <section>
          <h3 className="text-lg font-semibold text-black dark:text-white">Description</h3>
          <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{bug.description}</p>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-black dark:text-white">Reproduction Steps</h3>
          <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{bug.reproductionSteps}</p>
        </section>
        <section className="text-sm text-zinc-600 dark:text-zinc-400">
          Reported by Discord ID {bug.discordId} as Minecraft IGN {bug.minecraftIgn}
        </section>
      </div>
    </div>
  );
}
