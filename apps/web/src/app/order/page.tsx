import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import {
  SeasonBookOrderHistory,
  SeasonBookOrderHistoryEmptyState,
  SeasonBookOrderHistoryErrorState,
} from "@/components/season-book-order-history";
import { ApiClientError } from "@/lib/api/http";
import { getSeasonBookOrders } from "@/lib/api/season-books";

export const metadata: Metadata = {
  title: "주문 내역 | Basebook",
  description: "주문한 시즌북 목록과 현재 상태를 확인하는 화면",
};

export const dynamic = "force-dynamic";

async function loadSeasonBookOrders() {
  try {
    return {
      status: "success" as const,
      data: await getSeasonBookOrders(),
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        status: "error" as const,
        message: error.message,
      };
    }

    return {
      status: "error" as const,
      message:
        "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export default async function OrderHistoryPage() {
  const result = await loadSeasonBookOrders();

  return (
    <AppShell
      activeSection="order"
      title="주문 내역"
      sectionLabelOverride={null}
      tone="home"
    >
      {result.status === "error" ? (
        <SeasonBookOrderHistoryErrorState message={result.message} />
      ) : result.data.orders.length === 0 ? (
        <SeasonBookOrderHistoryEmptyState />
      ) : (
        <SeasonBookOrderHistory orderHistory={result.data} />
      )}
    </AppShell>
  );
}
