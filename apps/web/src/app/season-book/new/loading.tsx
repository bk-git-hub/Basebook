import { AppShell } from "@/components/app-shell";

export default function NewSeasonBookLoading() {
  return (
    <AppShell
      activeSection="season-book"
      title="시즌북 만들기"
      description="담을 기록을 고르고, 제목과 커버를 정한 뒤 견적 생성으로 이어갑니다."
    >
      <div className="space-y-8">
        <section className="rounded-[32px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10">
          <div className="h-5 w-32 rounded-full bg-white/15" />
          <div className="mt-6 h-9 w-full max-w-xl rounded-full bg-white/15" />
          <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-white/10" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-3 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[24px] bg-stone-100"
              />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-[28px] border border-stone-200 bg-white shadow-sm" />
        </section>
      </div>
    </AppShell>
  );
}
