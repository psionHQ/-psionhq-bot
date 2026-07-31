export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-3xl rounded-3xl border border-black/10 bg-white p-10 shadow-sm dark:border-white/10 dark:bg-black">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          PSIONHQ
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Website foundation initialized.
        </h1>
        <p className="mt-6 text-base leading-7 text-neutral-600 dark:text-neutral-300">
          This Next.js App Router project is ready for implementation while
          preserving the existing architecture blueprint.
        </p>
      </div>
    </main>
  );
}
