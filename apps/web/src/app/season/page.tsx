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
  title: "시즌 기록 | Basebook",
  description: "최신 시즌의 기록 요약과 최근 일지를 확인하는 화면",
};

export const dynamic = "force-dynamic";

type SeasonPageProps = {
  searchParams: Promise<{
    entryDeleted?: string;
  }>;
};

function getDeleteNotice(entryDeleted?: string) {
  if (entryDeleted === "success") {
    return "일지를 삭제했습니다.";
  }

  if (entryDeleted === "missing") {
    return "이미 삭제된 일지입니다.";
  }

  return null;
}

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

export default async function SeasonPage({ searchParams }: SeasonPageProps) {
  const resolvedSearchParams = await searchParams;
  const result = await loadSeasonEntries();
  const deleteNotice = getDeleteNotice(resolvedSearchParams.entryDeleted);

  return (
    <AppShell
      activeSection="season"
      title="시즌 기록"
      tone="home"
    >
      {deleteNotice ? (
        <section className="rounded-[24px] border border-[#dbe6f5] bg-[#eff4fb] px-5 py-4 shadow-[0_12px_30px_rgba(17,40,79,0.05)]">
          <p className="text-sm font-semibold text-[#11284f]">{deleteNotice}</p>
        </section>
      ) : null}

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
