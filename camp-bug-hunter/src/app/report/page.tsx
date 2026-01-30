import ButtonLink from "@/components/ButtonLink";

export default function ReportIntroPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="text-2xl font-semibold text-black dark:text-white">Report a Bug</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Please ensure your report is clear and actionable:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
        <li>Provide exact steps to reproduce.</li>
        <li>Include relevant screenshots or logs if applicable.</li>
        <li>Choose the correct severity (Low, Medium, High).</li>
        <li>Use your correct Discord ID and Minecraft IGN.</li>
      </ul>
      <div className="mt-6">
        <ButtonLink href="/report/new" variant="primary">I Understand</ButtonLink>
      </div>
    </div>
  );
}
