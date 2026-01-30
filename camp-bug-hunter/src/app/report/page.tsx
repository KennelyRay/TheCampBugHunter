import ButtonLink from "@/components/ButtonLink";

export default function ReportIntroPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Report a Bug</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Please ensure your report is clear and actionable:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Provide exact steps to reproduce.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Include relevant screenshots or logs if applicable.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Choose the correct severity (Low, Medium, High).
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Use your correct Discord ID and Minecraft IGN.
          </li>
        </ul>
        <div className="mt-6">
          <ButtonLink href="/report/new" variant="primary">I Understand</ButtonLink>
        </div>
      </div>
    </div>
  );
}
