"use client";
import { useState } from "react";
import ButtonLink from "@/components/ButtonLink";
import type { Bug } from "@/types/bug";

type BugSummary = Bug & { createdAt: string | Date };

export default function ReportSuccessPage() {
  const [summary] = useState<BugSummary | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("campLastReport");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as BugSummary;
    } catch {
      return null;
    }
  });
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-black/40 bg-gradient-to-br from-[#141922]/95 via-[#121720]/95 to-[#0f131a]/95 p-6 text-white shadow-2xl shadow-black/40">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f3a46b]/30 bg-[#f3a46b]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#f3a46b]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f3a46b] text-[11px] font-bold text-[#1f1a16]">✓</span>
              Submission received
            </div>
            <h2 className="text-3xl font-semibold text-white">Report Summary</h2>
            <p className="text-sm text-white/70">
              Thanks for helping keep the server polished. We&apos;ve queued your report for review.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-white/50">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60">
                1
              </span>
              <span>Guidelines</span>
            </div>
            <span className="h-px w-8 bg-white/20"></span>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60">
                2
              </span>
              <span>Report</span>
            </div>
            <span className="h-px w-8 bg-white/20"></span>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f3a46b]/60 bg-[#f3a46b]/20 text-[#f3a46b]">
                3
              </span>
              <span className="text-[#f3a46b]">Summary</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
          <h3 className="text-lg font-semibold text-white">Report details</h3>
          {summary ? (
            <div className="mt-4 space-y-5 text-sm text-white/80">
              <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Title</div>
                <div className="mt-2 text-base text-white">{summary.title}</div>
                <div className="mt-2 text-xs text-white/50">
                  Submitted {new Date(summary.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Description</div>
                <div className="mt-2 whitespace-pre-wrap text-white/80">{summary.description}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Reproduction steps</div>
                <div className="mt-2 whitespace-pre-wrap text-white/80">{summary.reproductionSteps}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Severity</div>
                  <div className="mt-2 text-white">{summary.severity}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Status</div>
                  <div className="mt-2 text-white">{summary.status.replaceAll("_", " ")}</div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Reporter</div>
                <div className="mt-2 grid gap-1 text-white/80">
                  <div>Discord: {summary.discordId}</div>
                  <div>Minecraft: {summary.minecraftIgn}</div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Evidence links</div>
                {summary.evidenceLinks.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-white/80">
                    {summary.evidenceLinks.map((link) => (
                      <li key={link} className="break-all">{link}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 text-white/60">No evidence links provided.</div>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/70">
              We couldn&apos;t find the submission details on this device. Submit another report to see a full summary.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/report/new" variant="secondary">Submit another</ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary">Dashboard</ButtonLink>
            <ButtonLink href="/" variant="primary">Back to Home</ButtonLink>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/40 bg-[#141922]/90 p-6 text-white shadow-lg shadow-black/30">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#f3a46b]">What happens next</div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Review</div>
                <div className="mt-2 text-sm text-white/80">We replicate the steps and confirm impact.</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Status</div>
                <div className="mt-2 text-sm text-white/80">The report is tagged and prioritized.</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0f131a]/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Update</div>
                <div className="mt-2 text-sm text-white/80">Follow progress in the bugs list.</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Quick tips</div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>Keep your reproduction steps short and numbered.</li>
              <li>Attach screenshots or short clips for faster triage.</li>
              <li>Check your dashboard for status updates.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
