import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { EntryEditForm } from "@/components/entry-edit-form";
import { EntryEditErrorState } from "@/components/entry-edit-state";
import { RouteLoadingScreen } from "@/components/route-loading-screen";
import { getFreshEntry } from "@/lib/api/entries-read.server";
import { ApiClientError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "기록 수정 | Basebook",
  description: "저장한 경기 기록의 정보와 감상을 수정하는 화면",
};

type EntryEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function loadEntry(id: string) {
  try {
    return {
      status: "success" as const,
      data: await getFreshEntry(id),
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

async function EntryEditPageContent({ params }: EntryEditPageProps) {
  const { id } = await params;
  const result = await loadEntry(id);

  return (
    <AppShell
      activeSection="entries"
      title="기록 수정"
      sectionLabelOverride={null}
      tone="home"
    >
      {result.status === "error" ? (
        <EntryEditErrorState message={result.message} />
      ) : (
        <EntryEditForm entry={result.data.entry} />
      )}
    </AppShell>
  );
}

export default function EntryEditPage(props: EntryEditPageProps) {
  return (
    <Suspense fallback={<RouteLoadingScreen title="수정 화면을 준비하는 중" />}>
      <EntryEditPageContent {...props} />
    </Suspense>
  );
}
