import { AppShell } from "@/components/app-shell";

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="h-4 w-20 rounded-full bg-stone-200" />
      <div className="mt-4 h-10 w-24 rounded-2xl bg-stone-200" />
    </div>
  );
}

export default function SeasonLoading() {
  return (
    <AppShell
      activeSection="season"
      title="시즌 대시보드"
      description="한 시즌 동안 쌓인 기록의 흐름과 최근 경기를 같은 자리에서 확인합니다."
    >
      <div className="space-y-8">
        <section className="animate-pulse rounded-[32px] bg-stone-900 px-8 py-10">
          <div className="h-6 w-32 rounded-full bg-white/15" />
          <div className="mt-6 h-5 w-28 rounded-full bg-white/15" />
          <div className="mt-4 h-12 w-72 rounded-3xl bg-white/15" />
          <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-white/15" />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded-full bg-stone-200" />
          <div className="mt-3 h-4 w-60 animate-pulse rounded-full bg-stone-100" />
          <div className="mt-6 space-y-3">
            <div className="h-28 animate-pulse rounded-[22px] bg-stone-100" />
            <div className="h-28 animate-pulse rounded-[22px] bg-stone-100" />
            <div className="h-28 animate-pulse rounded-[22px] bg-stone-100" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
