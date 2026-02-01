"use client";
import { useState } from "react";
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
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <div className="mt-1 text-sm text-white/60">All fields help us validate and reproduce the issue faster.</div>
        <div className="mt-6 grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-white/80">Discord ID</label>
            <input className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40" value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Minecraft IGN</label>
            <input className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40" value={minecraftIgn} onChange={(e) => setMinecraftIgn(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-white/80">Bug Title</label>
            <input className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-white/80">Bug Description</label>
            <textarea className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-white/80">Bug Reproduction Steps</label>
            <textarea className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40" rows={4} value={repro} onChange={(e) => setRepro(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Severity</label>
            <select className="mt-1 w-48 rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b]" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
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
        <div className="mt-6">
          <button
            className="rounded-lg bg-[#f3a46b] px-5 py-2 text-sm font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#ee9960] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? "Submitting..." : "Submit Bug Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
