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
      tone="home"
    >
      <SeasonBookOrderForm
        estimateSummary={estimateSummary}
        projectId={projectId}
      />
    </AppShell>
  );
}
