"use client";
import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Severity } from "@/types/bug";

export default function NewReportPage() {
  const router = useRouter();
  const authorized = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("camp-auth", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("camp-auth", onStoreChange);
      };
    },
    () => {
      if (typeof window === "undefined") return false;
      const raw = window.localStorage.getItem("campUser");
      if (!raw) return false;
      try {
        const parsed = JSON.parse(raw);
        return Boolean(parsed?.minecraftUsername);
      } catch {
        return false;
      }
    },
    () => false
  );
  const [discordId, setDiscordId] = useState("");
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reproSteps, setReproSteps] = useState<string[]>([""]);
  const [severity, setSeverity] = useState<Severity>("LOW");
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
      const cleanedLinks = evidenceLinks.map((link) => link.trim()).filter(Boolean);
      const cleanedSteps = reproSteps.map((step) => step.trim()).filter(Boolean);
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordId,
          minecraftIgn,
          title,
          description,
          reproductionSteps: cleanedSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
          severity,
          evidenceLinks: cleanedLinks,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      const bug = await res.json().catch(() => null);
      if (bug && typeof window !== "undefined") {
        window.localStorage.setItem("campLastReport", JSON.stringify(bug));
      }
      setShowSuccess(true);
      window.setTimeout(() => {
        router.push("/report/success");
      }, 1200);
    } catch {
      setError("Submission failed. Ensure database is configured.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authorized) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-black/40 bg-[#151a21]/95 p-6 text-white shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Login Required</h3>
            </div>
            <p className="mt-2 text-sm text-white/70">You must be logged in to submit a report.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/20 bg-[#0f131a]/70 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                onClick={() => router.push("/")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-[#f3a46b] px-4 py-2 text-sm font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition hover:bg-[#ee9960]"
                onClick={() => router.push("/login")}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f131a]/90 backdrop-blur transition-opacity duration-500">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#141922]/80 px-8 py-6 text-white shadow-2xl shadow-black/50">
            <div className="relative flex items-center justify-center">
              <span className="absolute h-12 w-12 rounded-full bg-[#f3a46b]/20 blur-xl"></span>
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#f3a46b]/30 border-t-[#f3a46b]"></span>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f3a46b]/90">Success</div>
              <div className="mt-2 text-xs text-white/70">Finalizing your summary</div>
            </div>
          </div>
        </div>
      )}
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
              <div className="mt-4 rounded-xl border border-black/40 bg-[#121722]/80 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Bug Reproduction Steps</div>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f3a46b]/60 bg-[#f3a46b]/10 text-[#f3a46b] transition hover:border-[#f3a46b] hover:bg-[#f3a46b]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                    onClick={() => setReproSteps((prev) => [...prev, ""])}
                    aria-label="Add reproduction step"
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                      <path
                        d="M10 4v12M4 10h12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 grid gap-3">
                  {reproSteps.map((step, index) => (
                    <div key={`repro-step-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0f131a]/80 text-xs font-semibold text-white/60">
                        {index + 1}
                      </div>
                      <input
                        className="w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
                        placeholder={`Step ${index + 1}`}
                        value={step}
                        onChange={(e) => {
                          const value = e.target.value;
                          setReproSteps((prev) => prev.map((item, i) => (i === index ? value : item)));
                        }}
                      />
                      <div className="flex items-center gap-2">
                        {reproSteps.length > 1 && (
                          <button
                            type="button"
                            className="rounded-lg border border-white/10 bg-[#0f131a]/70 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                            onClick={() => setReproSteps((prev) => prev.filter((_, i) => i !== index))}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Evidence Links</div>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f3a46b]/60 bg-[#f3a46b]/10 text-[#f3a46b] transition hover:border-[#f3a46b] hover:bg-[#f3a46b]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a46b]"
                  onClick={() => setEvidenceLinks((prev) => [...prev, ""])}
                  aria-label="Add evidence link"
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                    <path
                      d="M10 4v12M4 10h12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-3 grid gap-3">
                {evidenceLinks.map((link, index) => (
                  <div key={`evidence-link-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      className="w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#f3a46b] placeholder:text-white/40"
                      placeholder="https://"
                      value={link}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEvidenceLinks((prev) => prev.map((item, i) => (i === index ? value : item)));
                      }}
                    />
                    <div className="flex items-center gap-2">
                      {evidenceLinks.length > 1 && (
                        <button
                          type="button"
                          className="rounded-lg border border-white/10 bg-[#0f131a]/70 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                          onClick={() =>
                            setEvidenceLinks((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
