import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { EntryDetail } from "@/components/entry-detail";
import { EntryDetailErrorState } from "@/components/entry-detail-state";
import { getEntry } from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "기록 상세 | Basebook",
  description: "저장한 경기 기록의 요약과 감상, 사진을 확인하는 화면",
};

export const dynamic = "force-dynamic";

type EntryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function loadEntry(id: string) {
  try {
    return {
      status: "success" as const,
      data: await getEntry(id),
    };
  } catch (error) {
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

export default async function EntryDetailPage({
  params,
}: EntryDetailPageProps) {
  const { id } = await params;
  const result = await loadEntry(id);

  return (
    <AppShell
      activeSection="entries"
      title="기록 상세"
      description="저장된 경기 요약과 감상, 사진을 다시 읽고 바로 수정 흐름으로 이어갈 수 있습니다."
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
