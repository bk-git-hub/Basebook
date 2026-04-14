import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { SeasonDashboard } from "@/components/season-dashboard";
import {
  SeasonDashboardEmptyState,
  SeasonDashboardErrorState,
} from "@/components/season-dashboard-state";
import { getEntries } from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "시즌 대시보드 | Basebook",
  description: "한 시즌의 직관 기록과 승패 요약을 확인하는 화면",
};

export const dynamic = "force-dynamic";

async function loadSeasonEntries() {
  try {
    return {
      status: "success" as const,
      data: await getEntries(),
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

export default async function SeasonPage() {
  const result = await loadSeasonEntries();

  return (
    <AppShell
      activeSection="season"
      title="시즌 대시보드"
      description="한 시즌 동안 쌓인 기록의 흐름과 최근 경기를 같은 자리에서 확인합니다."
    >
      {result.status === "error" ? (
        <SeasonDashboardErrorState message={result.message} />
      ) : result.data.entries.length === 0 ? (
        <SeasonDashboardEmptyState />
      ) : (
        <SeasonDashboard dashboard={result.data} />
      )}
    </AppShell>
  );
}
