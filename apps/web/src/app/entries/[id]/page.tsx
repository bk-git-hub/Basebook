import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntryDetail } from "@/components/entry-detail";
import { EntryDetailErrorState } from "@/components/entry-detail-state";
import { getEntry } from "@/lib/api/entries";
import { ApiClientError, getApiBaseUrl } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "직관 기록 상세 | Sweetbook",
  description: "GET /entries/:id 응답을 표시하는 기록 상세 화면",
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
        "예상하지 못한 오류가 발생했습니다. 백엔드의 GET /entries/:id 응답을 다시 확인해 주세요.",
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
          <EntryDetailErrorState
            message={result.message}
            apiBaseUrl={getApiBaseUrl()}
          />
        ) : (
          <EntryDetail entry={result.data.entry} />
        )}
      </div>
    </main>
  );
}
