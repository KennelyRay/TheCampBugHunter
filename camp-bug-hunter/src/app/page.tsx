import ButtonLink from "@/components/ButtonLink";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-black dark:text-white">The Camp Bug Hunter</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Report and track bugs for The Camp. View existing reports or submit a new one.
          </p>
        </header>
        <section className="flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/bugs" variant="primary">View Bugs</ButtonLink>
          <ButtonLink href="/report" variant="secondary">Report a Bug</ButtonLink>
        </section>
      </main>
    </div>
  );
}
