"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Severity } from "@/types/bug";

export default function NewReportPage() {
  const router = useRouter();
  const [discordId, setDiscordId] = useState("");
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repro, setRepro] = useState("");
  const [severity, setSeverity] = useState<Severity>("LOW");
  const [videoEvidence, setVideoEvidence] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const severityOptions: { value: Severity; label: string; description: string; icon: string }[] = [
    { value: "LOW", label: "Low", description: "Minor issue, cosmetic, or typo.", icon: "/Low.svg" },
    { value: "MEDIUM", label: "Medium", description: "Gameplay impact but not blocking.", icon: "/Medium.svg" },
    { value: "HIGH", label: "High", description: "Major impact or exploitable behavior.", icon: "/High.svg?v=2" },
    { value: "URGENT", label: "Urgent", description: "Game breaking, can ruin server economy.", icon: "/Urgent.svg" },
  ];

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      let uploadedFileNames: string[] = [];
      if (evidenceFiles.length > 0) {
        const formData = new FormData();
        for (const file of evidenceFiles) {
          formData.append("files", file);
        }
        const uploadRes = await fetch("/api/evidence/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error("Failed to upload evidence");
        }
        const uploadData = (await uploadRes.json()) as { files?: { fileName: string }[] };
        uploadedFileNames = Array.isArray(uploadData.files)
          ? uploadData.files.map((file) => file.fileName)
          : [];
      }

      const trimmedVideoEvidence = videoEvidence.trim();
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordId,
          minecraftIgn,
          title,
          description,
          reproductionSteps: repro,
          severity,
          videoEvidence: trimmedVideoEvidence ? trimmedVideoEvidence : null,
          evidenceFileNames: uploadedFileNames,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      router.push("/report/success");
    } catch {
      setError("Submission failed. Ensure database is configured.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Bug Hunter Form</h2>
            <p className="mt-1 text-sm text-white/70">Provide the details below so we can reproduce the issue quickly.</p>
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
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f3a46b]/60 bg-[#f3a46b]/20 text-[#f3a46b]">
                2
              </span>
              <span className="text-[#f3a46b]">Report</span>
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
        <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
          <div className="text-sm text-white/60">All fields help us validate and reproduce the issue faster.</div>
          <div className="mt-6 space-y-8">
            <div>
              <div className="text-base font-semibold text-white">Reporter details</div>
              <div className="mt-1 text-xs text-white/50">We only use this to follow up on the report.</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/80">Discord ID</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
                    placeholder="User#0000"
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80">Minecraft IGN</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
                    placeholder="PlayerName"
                    value={minecraftIgn}
                    onChange={(e) => setMinecraftIgn(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="text-base font-semibold text-white">Bug summary</div>
              <div className="mt-1 text-xs text-white/50">Give a quick title and a clear description.</div>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80">Bug Title</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
                    placeholder="Mob stack drops duplicated items"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80">Bug Description</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
                    rows={4}
                    placeholder="Explain what happened, what you expected, and where it occurred."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="text-base font-semibold text-white">Reproduction steps</div>
              <div className="mt-1 text-xs text-white/50">List steps in order so we can replay it.</div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-white/80">Bug Reproduction Steps</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
                  rows={5}
                  placeholder="1. Go to the mob farm\n2. Stack a Zombie to x100\n3. Drop a shulker box..."
                  value={repro}
                  onChange={(e) => setRepro(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="text-base font-semibold text-white">Severity</div>
              <div className="mt-1 text-xs text-white/50">Choose the impact level of this bug.</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {severityOptions.map((option) => {
                  const isActive = severity === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSeverity(option.value)}
                      className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ease-out ${
                        isActive
                          ? "border-[#f3a46b] bg-[#f3a46b]/15 text-[#f3a46b] shadow-lg shadow-black/30"
                          : "border-black/40 bg-[#0f131a]/80 text-white/80 hover:border-[#f3a46b]/60 hover:bg-[#151b23]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image src={option.icon} alt="" width={18} height={18} className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isActive ? "bg-[#f3a46b]" : "bg-white/30"
                          }`}
                        ></span>
                      </div>
                      <div className="mt-2 text-xs font-normal text-white/60">{option.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl border border-black/40 bg-[#121722]/80 p-4">
              <div className="text-sm font-semibold text-white">Evidence</div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/80">Upload Evidence</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/80 file:mr-4 file:rounded-md file:border-0 file:bg-[#f3a46b] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#1f1a16] hover:file:bg-[#ee9960]"
                    type="file"
                    multiple
                    onChange={(e) => setEvidenceFiles(Array.from(e.target.files ?? []))}
                  />
                  <p className="mt-2 text-xs text-white/50">Screenshots, logs, or ZIP files work best.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80">Video Evidence Link</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
                    placeholder="https://"
                    value={videoEvidence}
                    onChange={(e) => setVideoEvidence(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-white/50">Use Medal, Streamable, or YouTube.</p>
                </div>
              </div>
              {evidenceFiles.length > 0 && (
                <div className="mt-3 text-xs text-white/60">
                  Selected: {evidenceFiles.map((file) => file.name).join(", ")}
                </div>
              )}
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/report"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold shadow-sm transition-all duration-200 ease-out transform-gpu border border-[#f3a46b]/60 text-[#f3a46b] hover:border-[#f3a46b] hover:bg-[#f3a46b]/10 hover:shadow-[#f3a46b]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
            >
              Back
            </Link>
            <button
              className="rounded-lg bg-[#f3a46b] px-5 py-2 text-sm font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "Submitting..." : "Submit Bug Report"}
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#f3a46b]">Submission checklist</div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>Include a clear title and where it happens.</li>
              <li>Write steps that anyone can follow.</li>
              <li>Add screenshots or short videos if possible.</li>
              <li>Choose a severity that matches impact.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-black/40 bg-[#141922]/90 p-6 text-white shadow-lg shadow-black/30">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Severity guide</div>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {severityOptions.map((option) => (
                <div key={option.value} className="flex items-start gap-3">
                  <Image src={option.icon} alt="" width={16} height={16} className="mt-0.5 h-4 w-4" />
                  <div>
                    <div className="font-semibold text-white">{option.label}</div>
                  <div>{option.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
