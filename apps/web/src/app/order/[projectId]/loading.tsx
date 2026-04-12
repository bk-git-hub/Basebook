export default function OrderLoading() {
  return (
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-950 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[32px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10">
          <div className="h-5 w-40 rounded-full bg-white/15" />
          <div className="mt-6 h-10 w-full max-w-2xl rounded-full bg-white/15" />
          <div className="mt-4 h-4 w-full max-w-3xl rounded-full bg-white/10" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-96 animate-pulse rounded-[28px] border border-stone-200 bg-white shadow-sm" />
          <div className="h-96 animate-pulse rounded-[28px] border border-stone-200 bg-white shadow-sm" />
        </section>
      </div>
    </main>
  );
}
