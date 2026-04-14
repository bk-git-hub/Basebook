import { AppShell } from "@/components/app-shell";

export default function EntryEditLoading() {
  return (
    <AppShell
      activeSection="entries"
      title="직관 기록 수정"
      description="변경한 항목만 저장하는 흐름 안에서 경기 정보와 감상을 다시 다듬습니다."
    >
      <div className="space-y-8">
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
    </AppShell>
  );
}
