import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntryDetail } from "@/components/entry-detail";
import { EntryDetailErrorState } from "@/components/entry-detail-state";
import { getEntry } from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "직관 기록 상세 | Sweetbook",
  description: "저장한 직관 기록의 경기 요약과 감상을 확인하는 화면",
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
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-950 sm:px-10">
      <div className="mx-auto max-w-6xl">
        {result.status === "error" ? (
          <EntryDetailErrorState message={result.message} />
        ) : (
          <EntryDetail entry={result.data.entry} />
        )}
      </div>
    </main>
  );
}
