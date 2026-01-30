import ButtonLink from "@/components/ButtonLink";

export default function ReportSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Thank You!</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Your report has been submitted and will appear in the admin dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/bugs" variant="secondary">View Bugs</ButtonLink>
          <ButtonLink href="/" variant="primary">Back to Home</ButtonLink>
        </div>
      </div>
    </div>
  );
}
