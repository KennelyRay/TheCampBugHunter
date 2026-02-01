"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ButtonLink from "@/components/ButtonLink";

export default function ReportIntroPage() {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Report a Bug</h2>
            <p className="mt-1 text-sm text-white/70">Follow these steps to submit a high-quality report.</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-white/50">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f3a46b]/60 bg-[#f3a46b]/20 text-[#f3a46b]">
                1
              </span>
              <span className="text-[#f3a46b]">Guidelines</span>
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
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60">
                3
              </span>
              <span>Summary</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
          <h3 className="text-lg font-semibold text-white">Please make sure your report is clear and actionable:</h3>
          <div className="mt-4 space-y-5 text-sm text-white/70">
            <div>
              <div className="text-sm font-semibold text-white">Include exact steps to reproduce the issue (numbered, in order).</div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/50">Example:</div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-white/70">
                <li>Stack a Zombie to x100</li>
                <li>Drop a Shulker box of item for the Zombie to pickup</li>
                <li>Kill the Zombie using a Weapon with NO STACK CONTROL</li>
                <li>Verify that the Shulker box has dropped but the stack Zombie is still holding it</li>
                <li>Keep killing the stacked Zombie until it drops another Shulker box.</li>
              </ol>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Attach relevant screenshots, videos, or logs if available.</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                <li>Videos should sent via: Medal, Streamable, or Youtube Link (Try to keep video as short as possible).</li>
                <li>If you have console logs and and Images Compress them to a ZIP fil before uploading to evidence field.</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Select the correct severity level: Low / Medium / High.</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                <li>Low: It doesn&apos;t affect gameplay, grammatical errors and wrong spellings</li>
                <li>Medium: It affects gameplay but not that much, visual annoyance</li>
                <li>High: It affects gameplay very much, can be abused if not fixed,</li>
                <li>Urgent: It can break the game, can be used exploit as an exploit, can ruin game economy</li>
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-semibold text-white">Provide your details: correct Discord ID and Minecraft IGN.</div>
              <ButtonLink href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID" variant="secondary">
                How get discord id
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/40 bg-[#141922]/90 p-6 text-white shadow-lg shadow-black/30">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#f3a46b]">Important Note</div>
            <p className="mt-3 text-sm text-white/70">
              DO NOT USE THIS TO REPORT THAT YOUR ITEM IS MISSING, OR YOU DIED AND LOST YOUR ITEMS BECAUSE OF SERVER FAULT, WE HAVE A TICKET CHANNEL ON DISCORD.
            </p>
          </div>
          <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
            <h4 className="text-base font-semibold text-white">Ready to submit?</h4>
            <p className="mt-2 text-sm text-white/70">Proceed to the report form once you&apos;ve reviewed the guidelines.</p>
            <label className="mt-4 flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="h-4 w-4 rounded border border-white/30 bg-[#0f131a]/80 text-[#f3a46b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
              />
              <span>I fully read and understood the guidelines.</span>
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/" variant="secondary">Back</ButtonLink>
              <button
                type="button"
                disabled={!acknowledged}
                onClick={() => router.push("/report/new")}
                className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-out transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  acknowledged
                    ? "bg-[#f3a46b] text-[#1f1a16] shadow-[#f3a46b]/30 hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-[#f3a46b]/40 active:translate-y-0 active:scale-[0.98]"
                    : "cursor-not-allowed bg-[#f3a46b]/40 text-[#1f1a16]/60 shadow-none"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
