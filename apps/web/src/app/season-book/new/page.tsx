import Link from "next/link";
import type { Metadata } from "next";

import { SeasonBookBuilderForm } from "@/components/season-book-builder-form";
import { getEntries } from "@/lib/api/entries";
import { ApiClientError, getApiBaseUrl } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "시즌북 만들기 | Sweetbook",
  description: "GET /entries 응답으로 시즌북에 포함할 기록을 선택하는 화면",
};

export const dynamic = "force-dynamic";

async function loadSeasonBookEntries() {
  try {
    const response = await getEntries();

    return {
      status: "success" as const,
      entries: response.entries.toSorted((left, right) =>
        right.date.localeCompare(left.date),
      ),
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
        "예상하지 못한 오류가 발생했습니다. API 서버 상태와 응답 형식을 다시 확인해 주세요.",
    };
  }
}

export default async function NewSeasonBookPage() {
  const result = await loadSeasonBookEntries();

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-950 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[32px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-stone-200 uppercase">
                Season Book
              </span>
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-300">
                  기록 선택 단계
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  시즌북에 담을 경기 기록을 고르세요
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-300">
                  `GET /entries`로 기록을 불러오고, 선택한 기록을
                  `POST /season-books/estimate` 요청으로 연결해 시즌북 견적을
                  생성합니다.
                </p>
              </div>
            </div>

            <Link
              href="/season"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
            >
              시즌 대시보드로 돌아가기
            </Link>
          </div>
        </section>

        {result.status === "error" ? (
          <section className="rounded-[28px] border border-rose-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold tracking-[0.18em] text-rose-500 uppercase">
              GET /entries
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
              기록 목록을 불러오지 못했습니다
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              {result.message}
            </p>
            <p className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-500 ring-1 ring-stone-200">
              현재 API 주소: {getApiBaseUrl()}
            </p>
          </section>
        ) : result.entries.length === 0 ? (
          <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold tracking-[0.18em] text-stone-400 uppercase">
              Empty
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
              시즌북에 넣을 기록이 없습니다
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              먼저 새 직관 기록을 작성한 뒤 시즌북 선택 화면으로 돌아오세요.
            </p>
            <Link
              href="/entries/new"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              새 기록 작성하기
            </Link>
          </section>
        ) : (
          <SeasonBookBuilderForm entries={result.entries} />
        )}
      </div>
    </main>
  );
}
