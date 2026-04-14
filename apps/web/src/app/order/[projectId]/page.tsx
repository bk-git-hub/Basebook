import Link from "next/link";
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import {
  SeasonBookOrderForm,
  type OrderEstimateSummary,
} from "@/components/season-book-order-form";

export const metadata: Metadata = {
  title: "시즌북 주문 | Basebook",
  description: "시즌북을 받을 배송 정보를 입력하고 주문을 접수하는 화면",
};

type OrderPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    pageCount?: string | string[];
    totalPrice?: string | string[];
    currency?: string | string[];
    creditSufficient?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPositiveNumberParam(value: string | string[] | undefined) {
  const nextValue = Number(getSearchParamValue(value));

  return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : undefined;
}

function getOrderEstimateSummary(
  searchParams: Awaited<OrderPageProps["searchParams"]>,
): OrderEstimateSummary | undefined {
  const pageCount = getPositiveNumberParam(searchParams.pageCount);
  const totalPrice = getPositiveNumberParam(searchParams.totalPrice);

  if (!pageCount || !totalPrice) {
    return undefined;
  }

  const currency = getSearchParamValue(searchParams.currency);
  const normalizedCurrency = currency === "KRW" ? currency : "KRW";
  const creditSufficient = getSearchParamValue(searchParams.creditSufficient);

  return {
    pageCount,
    totalPrice,
    currency: normalizedCurrency,
    creditSufficient:
      creditSufficient === "true"
        ? true
        : creditSufficient === "false"
          ? false
          : undefined,
  };
}

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { projectId } = await params;
  const estimateSummary = getOrderEstimateSummary(await searchParams);

  return (
    <AppShell
      activeSection="order"
      title="시즌북 주문"
      description="견적 확인이 끝난 프로젝트에 배송 정보를 입력하고 주문 접수까지 이어갑니다."
      tone="home"
    >
      <div className="space-y-8">
        <section className="rounded-[30px] border border-[#e5ecf6] bg-white px-6 py-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)] sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
                order flow
              </span>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#5a6f91]">
                  주문 정보 입력
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#11284f] sm:text-4xl">
                  시즌북을 받을 배송 정보를 입력하세요
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[#5a6f91]">
                  견적을 확인한 시즌북의 수령인과 주소를 입력해 제작 주문을
                  이어갑니다.
                </p>
              </div>
            </div>

            <Link
              href="/season-book/new"
              className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-2.5 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
            >
              견적 화면으로 돌아가기
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                01 Shipping
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
                배송지 입력
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                수령인, 연락처, 주소를 입력해 주문에 필요한 기본 정보를 완성합니다.
              </p>
            </article>

            <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                02 Confirm
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
                주문 접수
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                견적 기준 페이지 수와 금액을 다시 확인한 뒤 주문을 확정합니다.
              </p>
            </article>

            <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                03 Track
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
                상태 조회
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                주문 후에는 제작과 배송 상태 화면으로 바로 이어집니다.
              </p>
            </article>
          </div>
        </section>

        <SeasonBookOrderForm
          estimateSummary={estimateSummary}
          projectId={projectId}
        />
      </div>
    </AppShell>
  );
}
