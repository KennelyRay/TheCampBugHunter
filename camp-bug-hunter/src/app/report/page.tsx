import ButtonLink from "@/components/ButtonLink";

export default function ReportIntroPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-black/40 bg-[#151a21]/90 p-6 shadow-lg shadow-black/30">
        <h2 className="text-2xl font-semibold text-white">Report a Bug</h2>
        <p className="mt-2 text-white/70">
          Please ensure your report is clear and actionable:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#f3a46b]"></span>
            Provide exact steps to reproduce.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#f3a46b]"></span>
            Include relevant screenshots or logs if applicable.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#f3a46b]"></span>
            Choose the correct severity (Low, Medium, High).
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#f3a46b]"></span>
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
