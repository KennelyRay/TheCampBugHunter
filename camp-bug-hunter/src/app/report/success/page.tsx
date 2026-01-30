import ButtonLink from "@/components/ButtonLink";

export default function ReportSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="text-2xl font-semibold text-black dark:text-white">Thank You!</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Your report has been submitted and will appear in the admin dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/bugs" variant="secondary">View Bugs</ButtonLink>
        <ButtonLink href="/" variant="primary">Back to Home</ButtonLink>
      </div>
    </div>
  );
}
