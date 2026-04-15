import Link from "next/link";
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { SeasonBookBuilderForm } from "@/components/season-book-builder-form";
import { getEntries } from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "시즌북 만들기 | Basebook",
  description: "시즌북에 담을 기록을 고르고 견적을 확인하는 화면",
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
        "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export default async function NewSeasonBookPage() {
  const result = await loadSeasonBookEntries();

  return (
    <AppShell
      activeSection="season-book"
      title="시즌북 만들기"
      description="담을 기록을 고르고 제목과 커버를 정한 뒤 견적을 확인합니다."
      tone="home"
    >
      <div className="space-y-6">
        <section className="rounded-[30px] border border-[#e5ecf6] bg-white px-6 py-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)] sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
                season book flow
              </span>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#5a6f91]">
                  기록 선택 단계
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-[#11284f] sm:text-3xl">
                  담을 기록을 고르고 견적까지 이어가세요
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[#5a6f91]">
                  기록을 고르고 제목과 커버를 정하면 예상 페이지 수와 금액을
                  볼 수 있습니다.
                </p>
              </div>
            </div>

            <Link
              href="/season"
              className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-2.5 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
            >
              시즌 대시보드로 돌아가기
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                01 Select
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
                기록 선택
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                시즌북에 담을 기록을 먼저 고릅니다.
              </p>
            </article>

            <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                02 Compose
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
                제목과 커버
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                제목, 소개문, 커버를 정합니다.
              </p>
            </article>

            <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                03 Estimate
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
                견적 확인
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                예상 페이지 수와 금액을 확인합니다.
              </p>
            </article>
          </div>
        </section>

        {result.status === "error" ? (
          <section className="rounded-[28px] border border-rose-200 bg-white p-8 shadow-[0_16px_40px_rgba(17,40,79,0.05)]">
            <p className="text-sm font-semibold tracking-[0.18em] text-rose-500 uppercase">
              Season Book
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#11284f]">
              기록을 불러오지 못했어요
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5a6f91]">
              {result.message}
            </p>
          </section>
        ) : result.entries.length === 0 ? (
          <section className="rounded-[28px] border border-[#e5ecf6] bg-white p-8 shadow-[0_16px_40px_rgba(17,40,79,0.05)]">
            <p className="text-sm font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
              Empty
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#11284f]">
              시즌북에 넣을 기록이 없습니다
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5a6f91]">
              먼저 기록을 남기면 여기서 시즌북을 만들 수 있습니다.
            </p>
            <Link
              href="/entries/new"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#11284f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
            >
              새 기록 작성하기
            </Link>
          </section>
        ) : (
          <SeasonBookBuilderForm entries={result.entries} />
        )}
      </div>
    </AppShell>
  );
}
