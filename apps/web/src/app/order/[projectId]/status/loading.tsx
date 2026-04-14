import { AppShell } from "@/components/app-shell";

export default function OrderStatusLoading() {
  return (
    <AppShell
      activeSection="order"
      title="주문 진행 상태"
      description="결제 이후 제작과 배송 단계가 어디까지 왔는지 재진입과 새로고침 기준으로 확인합니다."
    >
      <div className="space-y-8">
        <section className="animate-pulse rounded-[32px] bg-stone-900 px-8 py-10">
          <div className="h-6 w-32 rounded-full bg-white/15" />
          <div className="mt-6 h-5 w-40 rounded-full bg-white/15" />
          <div className="mt-4 h-12 w-3/4 rounded-3xl bg-white/15" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-white/15" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="h-[34rem] animate-pulse rounded-[28px] bg-white" />
          <div className="h-[34rem] animate-pulse rounded-[28px] bg-white" />
        </section>
      </div>
    </AppShell>
  );
}
