import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { SeasonBookOrderStatus } from "@/components/season-book-order-status";
import { SeasonBookOrderStatusErrorState } from "@/components/season-book-order-status-state";
import { getSeasonBookStatus } from "@/lib/api/season-books";
import { ApiClientError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "주문 진행 상태 | Basebook",
  description: "시즌북 주문 이후의 제작 및 배송 진행 단계를 확인하는 화면",
};

export const dynamic = "force-dynamic";

type OrderStatusPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

async function loadOrderStatus(projectId: string) {
  try {
    return {
      status: "success" as const,
      data: await getSeasonBookStatus(projectId),
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
      message: "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export default async function OrderStatusPage({
  params,
}: OrderStatusPageProps) {
  const { projectId } = await params;
  const result = await loadOrderStatus(projectId);

  return (
    <AppShell
      activeSection="order"
      title="주문 진행 상태"
      tone="home"
    >
      {result.status === "error" ? (
        <SeasonBookOrderStatusErrorState
          message={result.message}
          projectId={projectId}
        />
      ) : (
        <SeasonBookOrderStatus status={result.data} />
      )}
    </AppShell>
  );
}
