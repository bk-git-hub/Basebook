export default function EntryEditLoading() {
  return (
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-950 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="animate-pulse rounded-[32px] bg-stone-900 px-8 py-10">
          <div className="h-6 w-24 rounded-full bg-white/15" />
          <div className="mt-6 h-5 w-40 rounded-full bg-white/15" />
          <div className="mt-4 h-12 w-3/4 rounded-3xl bg-white/15" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-white/15" />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-[28px] bg-white" />
          <div className="h-96 animate-pulse rounded-[28px] bg-white" />
        </section>

        <section className="grid gap-4">
          <div className="h-96 animate-pulse rounded-[28px] bg-white" />
        </section>
      </div>
    </main>
  );
}
