"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [email, setEmail] = useState("");
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLoader(false);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, []);

  function showStatus(message: string, nextPath: string) {
    setStatusMessage(message);
    window.setTimeout(() => {
      setStatusMessage(null);
      router.push(nextPath);
    }, 1000);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordChecks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  function handleRegister() {
    if (submitting) return;
    setError(null);
    setSuccess(null);

    if (!normalizedEmail || !minecraftUsername.trim() || !password || !confirmPassword) {
      setError("Fill out all fields.");
      return;
    }

    if (!/.+@.+\..+/.test(normalizedEmail)) {
      setError("Enter a valid email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordChecks.some((check) => !check.met)) {
      setError("Password does not meet requirements.");
      return;
    }

    setVerificationError(null);
    setShowVerificationModal(true);
  }

  async function confirmVerification() {
    if (submitting) return;
    setVerificationError(null);
    setError(null);
    setSuccess(null);

    if (!verificationCode.trim()) {
      setVerificationError("Enter your verification code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          minecraftUsername: minecraftUsername.trim(),
          verificationCode: verificationCode.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data.error ?? "Registration failed.";
        setVerificationError(message);
        setError(message);
        return;
      }
      setSuccess("Account created. You can sign in now.");
      setPassword("");
      setConfirmPassword("");
      setVerificationCode("");
      setShowVerificationModal(false);
      showStatus("Successfully registered, please wait!", "/login");
    } catch {
      setVerificationError("Registration failed. Ensure database is configured.");
      setError("Registration failed. Ensure database is configured.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative isolate min-h-[calc(100vh-12rem)]">
      {isClient &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0f131a]/90 backdrop-blur transition-opacity duration-500 ${
              showLoader || statusMessage ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#141922]/80 px-8 py-6 text-white shadow-2xl shadow-black/50">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-12 w-12 rounded-full bg-[#22d3ee]/20 blur-xl"></span>
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#22d3ee]/30 border-t-[#22d3ee]"></span>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#22d3ee]/90">
                  {statusMessage ? "Success" : "Loading"}
                </div>
                <div className="mt-2 text-xs text-white/70">
                  {statusMessage ?? "Preparing your session"}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#151a21]/95 p-6 text-white shadow-2xl shadow-black/50 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#22d3ee]/80">Verification</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Enter your code</h2>
              </div>
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-[#0f131a]/70 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
                onClick={() => setShowVerificationModal(false)}
                disabled={submitting}
              >
                Close
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0f131a]/60 p-4">
              <div className="text-sm font-semibold text-white/90">Get your code in-game</div>
              <div className="mt-2 grid gap-2 text-xs text-white/70">
                <div>1. Join the Minecraft server.</div>
                <div>2. Run <span className="text-[#22d3ee]">/bughunter register</span>.</div>
                <div>3. Paste the code below within 10 minutes.</div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/80">Verification Code</label>
              <input
                className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm uppercase tracking-[0.2em] text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#22d3ee] placeholder:text-white/40"
                type="text"
                placeholder="ENTER CODE"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
              />
              {verificationError && <div className="mt-2 text-sm text-red-400">{verificationError}</div>}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-[#0f131a]/70 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                onClick={() => setShowVerificationModal(false)}
                disabled={submitting}
              >
                Back
              </button>
              <button
                className="rounded-lg bg-[#22d3ee] px-5 py-2 text-sm font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#06b6d4] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee]"
                type="button"
                onClick={confirmVerification}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Code"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed inset-0 z-0 h-screen w-screen">
        <Image src="/LandingPage.png" alt="MasterCraft landscape" fill className="object-cover object-center" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-black/40"></div>
      </div>
      <div
        className={`relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-6xl items-center justify-center px-6 transition-opacity duration-500 ${
          showLoader || statusMessage ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="w-full max-w-2xl rounded-2xl border border-black/40 bg-[#151a21]/85 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex items-center gap-4">
              <Image
                src="/MasterCraftLogo.png"
                alt="MasterCraft Logo"
                width={140}
                height={60}
                className="h-14 w-auto sm:h-16"
                quality={100}
                priority
              />
            </div>
            <p className="mt-2 text-sm text-white/70">Join to submit and track bug reports.</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white/80">Email</label>
              <input
                className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#22d3ee] placeholder:text-white/40"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80">Minecraft Username</label>
              <input
                className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#22d3ee] placeholder:text-white/40"
                type="text"
                placeholder="MasterCraftHunter"
                value={minecraftUsername}
                onChange={(event) => setMinecraftUsername(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <input
                  className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 pr-16 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#22d3ee] placeholder:text-white/40"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-[#0f131a]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70 transition hover:border-[#22d3ee]/60 hover:text-[#22d3ee]"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                {passwordChecks.map((check) => (
                  <div key={check.label} className={`flex items-center gap-2 ${check.met ? "text-emerald-400" : "text-white/50"}`}>
                    <span className={`h-2 w-2 rounded-full ${check.met ? "bg-emerald-400" : "bg-white/30"}`}></span>
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80">Confirm Password</label>
              <div className="relative">
                <input
                  className="mt-1 w-full rounded-lg border border-black/40 bg-[#0f131a]/80 px-3 py-2 pr-16 text-sm text-white/90 shadow-sm outline-none ring-1 ring-transparent transition focus-visible:ring-2 focus-visible:ring-[#22d3ee] placeholder:text-white/40"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-[#0f131a]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70 transition hover:border-[#22d3ee]/60 hover:text-[#22d3ee]"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              className="rounded-lg bg-[#22d3ee] px-5 py-2 text-sm font-semibold text-[#1f1a16] shadow-lg shadow-black/30 transition-all duration-200 ease-out transform-gpu hover:-translate-y-0.5 hover:bg-[#06b6d4] hover:shadow-black/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee]"
              type="button"
              disabled={submitting}
              onClick={handleRegister}
            >
              {submitting ? "Creating..." : "Create Account"}
            </button>
            <span className="text-sm text-white/60">
              Already have an account?{" "}
              <Link href="/login" className="text-[#22d3ee] hover:text-[#06b6d4]">
                Sign in
              </Link>
            </span>
          </div>
          {(error || success) && (
            <div className={`mt-4 text-sm ${error ? "text-red-400" : "text-emerald-300"}`}>{error ?? success}</div>
          )}
        </div>
      </div>
    </div>
  );
}
