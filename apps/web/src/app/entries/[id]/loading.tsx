import { AppShell } from "@/components/app-shell";

export default function EntryDetailLoading() {
  return (
    <AppShell
      activeSection="entries"
      title="직관 기록 상세"
      description="저장된 경기 요약과 감상을 다시 읽고, 바로 수정 흐름으로 이어갈 수 있습니다."
    >
      <div className="space-y-8">
        <section className="animate-pulse rounded-[32px] bg-stone-900 px-8 py-10">
          <div className="h-6 w-28 rounded-full bg-white/15" />
          <div className="mt-6 h-5 w-40 rounded-full bg-white/15" />
          <div className="mt-4 h-12 w-3/4 rounded-3xl bg-white/15" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-white/15" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="h-72 animate-pulse rounded-[28px] bg-white" />
          <div className="h-72 animate-pulse rounded-[28px] bg-white" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-72 animate-pulse rounded-[28px] bg-white" />
          <div className="h-72 animate-pulse rounded-[28px] bg-white" />
        </section>
      </div>
    </AppShell>
  );
}
