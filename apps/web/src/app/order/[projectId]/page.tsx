import Link from "next/link";
import type { Metadata } from "next";

import { SeasonBookOrderForm } from "@/components/season-book-order-form";

export const metadata: Metadata = {
  title: "시즌북 주문 | Sweetbook",
  description: "POST /season-books/order 요청을 수행하는 시즌북 주문 화면",
};

type OrderPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-950 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[32px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-stone-200 uppercase">
                Season Book Order
              </span>
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-300">
                  주문 정보 입력
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  시즌북을 받을 배송 정보를 입력하세요
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-300">
                  `POST /season-books/order`로 주문 요청을 생성합니다. 결제와
                  배송 추적은 이번 슬라이스 범위에서 제외하고, 주문 API 통신
                  흐름을 먼저 연결합니다.
                </p>
              </div>
            </div>

            <Link
              href="/season-book/new"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
            >
              견적 화면으로 돌아가기
            </Link>
          </div>
        </section>

        <SeasonBookOrderForm projectId={projectId} />
      </div>
    </main>
  );
}
