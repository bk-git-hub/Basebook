import type { Metadata } from "next";

import { SeasonDashboard } from "@/components/season-dashboard";
import {
  SeasonDashboardEmptyState,
  SeasonDashboardErrorState,
} from "@/components/season-dashboard-state";
import { getEntries } from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "시즌 대시보드 | Sweetbook",
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
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-950 sm:px-10">
      <div className="mx-auto max-w-6xl">
        {result.status === "error" ? (
          <SeasonDashboardErrorState message={result.message} />
        ) : result.data.entries.length === 0 ? (
          <SeasonDashboardEmptyState />
        ) : (
          <SeasonDashboard dashboard={result.data} />
        )}
      </div>
    </main>
  );
}
