import { AppShell } from "@/components/app-shell";

export default function OrderLoading() {
  return (
    <AppShell
      activeSection="order"
      title="시즌북 주문"
      description="견적 확인이 끝난 프로젝트에 배송 정보를 입력하고 주문 접수까지 이어갑니다."
    >
      <div className="space-y-8">
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
    </AppShell>
  );
}
