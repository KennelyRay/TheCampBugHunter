import Image from "next/image";
import ButtonLink from "@/components/ButtonLink";
import { BugRepository } from "@/lib/bugRepository";
import type { Bug } from "@/types/bug";

export const dynamic = "force-dynamic";

async function getBug(id: string, includeHidden: boolean): Promise<Bug | null> {
  const repo = new BugRepository();
  return repo.get(id, { includeHidden });
}

export default async function BugPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { id } = await params;
  const adminFlag = searchParams?.admin;
  const includeHiddenParam = searchParams?.includeHidden;
  const isAdmin = adminFlag === "1";
  const backHref = isAdmin ? "/admin" : "/bugs";
  const includeHidden =
    isAdmin ||
    includeHiddenParam === "true" ||
    (Array.isArray(includeHiddenParam) && includeHiddenParam.includes("true"));
  const bug = await getBug(id, includeHidden);
  if (!bug) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
        <h2 className="text-xl font-semibold text-white">Bug Not Found</h2>
        <p className="mt-2 text-sm text-white/70">The bug might not exist or the database is not configured.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <ButtonLink href={backHref} variant="secondary">
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M12.5 4.5L7.5 10l5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Back</span>
            </span>
          </ButtonLink>
        </div>
        <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Bug report</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">{bug.title}</h2>
          <div className="mt-4 rounded-xl border border-white/10 bg-[#0f131a]/70 px-4 py-3 text-xs text-white/70">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Reporter</div>
            <div className="mt-2">Discord ID: {bug.discordId}</div>
            <div>Minecraft IGN: {bug.minecraftIgn}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200 shadow-lg shadow-black/20">
          Bug details are restricted to admins to prevent abuse.
        </div>
      </div>
    );
  }

  const severityMeta: Record<Bug["severity"], { label: string; icon: string }> = {
    LOW: { label: "Low", icon: "/Low.svg" },
    MEDIUM: { label: "Medium", icon: "/Medium.svg" },
    HIGH: { label: "High", icon: "/High.svg?v=2" },
    URGENT: { label: "Urgent", icon: "/Urgent.svg" },
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <ButtonLink href={backHref} variant="secondary">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
              <path
                d="M12.5 4.5L7.5 10l5 5.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </span>
        </ButtonLink>
      </div>
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Bug report</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">{bug.title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/10 bg-[#0f131a]/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                {bug.status.replaceAll("_", " ")}
              </span>
              <div className="flex items-center gap-2">
                <Image src={severityMeta[bug.severity].icon} alt="" width={16} height={16} className="h-4 w-4" />
                <span className="font-semibold text-white">{severityMeta[bug.severity].label}</span>
              </div>
              <span className="text-xs text-white/50">{new Date(bug.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 px-4 py-3 text-xs text-white/70">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Reporter</div>
            <div className="mt-2">Discord ID: {bug.discordId}</div>
            <div>Minecraft IGN: {bug.minecraftIgn}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <section className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
          <h3 className="text-lg font-semibold text-white">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{bug.description}</p>
        </section>
        <section className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
          <h3 className="text-lg font-semibold text-white">Reproduction Steps</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{bug.reproductionSteps}</p>
        </section>
        {bug.evidenceLinks.length > 0 && (
          <section className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
            <h3 className="text-lg font-semibold text-white">Evidence Links</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#f3a46b]">
              {bug.evidenceLinks.map((link, index) => (
                <li key={`${link}-${index}`}>
                  <a className="hover:text-[#ee9960]" href={link} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
