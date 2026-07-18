import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { EntryDetail } from "@/components/entry-detail";
import { EntryDetailErrorState } from "@/components/entry-detail-state";
import { RouteLoadingScreen } from "@/components/route-loading-screen";
import { getCachedEntry } from "@/lib/api/entries-read.server";
import { ApiClientError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "기록 상세 | Basebook",
  description: "저장한 경기 기록의 요약과 감상, 사진을 확인하는 화면",
};

type EntryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function loadEntry(id: string) {
  try {
    return {
      status: "success" as const,
      data: await getCachedEntry(id),
    };
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ApiClientError) {
      if (error.status === 404) {
        notFound();
      }

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

async function EntryDetailPageContent({
  params,
}: EntryDetailPageProps) {
  const { id } = await params;
  const result = await loadEntry(id);

  return (
    <AppShell
      activeSection="entries"
      title="기록 상세"
      tone="home"
    >
      {result.status === "error" ? (
        <EntryDetailErrorState message={result.message} />
      ) : (
        <EntryDetail entry={result.data.entry} />
      )}
    </AppShell>
  );
}

export default function EntryDetailPage(props: EntryDetailPageProps) {
  return (
    <Suspense fallback={<RouteLoadingScreen title="기록을 준비하는 중" />}>
      <EntryDetailPageContent {...props} />
    </Suspense>
  );
}
