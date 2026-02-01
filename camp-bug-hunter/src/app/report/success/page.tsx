import ButtonLink from "@/components/ButtonLink";

export default function ReportSuccessPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Report Summary</h2>
            <p className="mt-1 text-sm text-white/70">Your submission is in. Here is what happens next.</p>
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
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 text-white shadow-lg shadow-black/30">
        <h3 className="text-lg font-semibold text-white">Thank You!</h3>
        <p className="mt-2 text-sm text-white/70">
          Your report has been submitted and will appear in the admin dashboard after review.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/report/new" variant="secondary">Back</ButtonLink>
          <ButtonLink href="/bugs" variant="secondary">View Bugs</ButtonLink>
          <ButtonLink href="/" variant="primary">Back to Home</ButtonLink>
        </div>
      </div>
    </div>
  );
}
