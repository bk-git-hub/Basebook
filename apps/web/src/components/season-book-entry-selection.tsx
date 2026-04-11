"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  DiaryEntry,
  GameResult,
  TeamCode,
} from "@basebook/contracts";

type SeasonBookEntrySelectionProps = {
  entries: DiaryEntry[];
};

const TEAM_LABELS: Record<TeamCode, string> = {
  LG: "LG 트윈스",
  DOOSAN: "두산 베어스",
  SSG: "SSG 랜더스",
  KIWOOM: "키움 히어로즈",
  KT: "KT 위즈",
  NC: "NC 다이노스",
  KIA: "KIA 타이거즈",
  LOTTE: "롯데 자이언츠",
  SAMSUNG: "삼성 라이온즈",
  HANWHA: "한화 이글스",
};

const RESULT_LABELS: Record<GameResult, string> = {
  WIN: "승리",
  LOSE: "패배",
  DRAW: "무승부",
  UNKNOWN: "미정",
};

const RESULT_TONE: Record<GameResult, string> = {
  WIN: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  LOSE: "bg-rose-50 text-rose-700 ring-rose-600/15",
  DRAW: "bg-amber-50 text-amber-700 ring-amber-600/15",
  UNKNOWN: "bg-stone-100 text-stone-600 ring-stone-500/10",
};

function formatEntryDate(date: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(date));
}

function formatScore(entry: DiaryEntry): string {
  if (
    typeof entry.scoreFor === "number" &&
    typeof entry.scoreAgainst === "number"
  ) {
    return `${entry.scoreFor} : ${entry.scoreAgainst}`;
  }

  return "점수 미기록";
}

function formatEntryTitle(entry: DiaryEntry): string {
  return `${TEAM_LABELS[entry.favoriteTeam]} vs ${TEAM_LABELS[entry.opponentTeam]}`;
}

export function SeasonBookEntrySelection({
  entries,
}: SeasonBookEntrySelectionProps) {
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const selectedEntryIdSet = new Set(selectedEntryIds);
  const selectedEntries = entries.filter((entry) =>
    selectedEntryIdSet.has(entry.id),
  );
  const selectedPhotoCount = selectedEntries.reduce(
    (total, entry) => total + entry.photos.length,
    0,
  );
  const selectedSeasonYear = selectedEntries[0]?.seasonYear;

  function toggleEntry(entryId: string) {
    setSelectedEntryIds((current) =>
      current.includes(entryId)
        ? current.filter((id) => id !== entryId)
        : [...current, entryId],
    );
  }

  function selectAllEntries() {
    setSelectedEntryIds(entries.map((entry) => entry.id));
  }

  function clearSelection() {
    setSelectedEntryIds([]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              시즌북에 넣을 기록
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              `GET /entries`로 가져온 기록 중 시즌북에 포함할 항목을 고릅니다.
              견적 생성 API는 다음 슬라이스에서 연결합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectAllEntries}
              className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            >
              선택 해제
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {entries.map((entry) => {
            const isSelected = selectedEntryIdSet.has(entry.id);

            return (
              <article
                key={entry.id}
                className={`rounded-[24px] border px-5 py-4 transition ${
                  isSelected
                    ? "border-stone-950 bg-stone-950 text-white shadow-lg shadow-stone-950/10"
                    : "border-stone-200 bg-stone-50/80 hover:border-stone-300"
                }`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleEntry(entry.id)}
                    aria-pressed={isSelected}
                    className="flex flex-1 items-start gap-4 text-left"
                  >
                    <span
                      className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        isSelected
                          ? "border-white bg-white text-stone-950"
                          : "border-stone-300 bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="space-y-3">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            isSelected
                              ? "bg-white/15 text-white ring-white/20"
                              : RESULT_TONE[entry.result]
                          }`}
                        >
                          {RESULT_LABELS[entry.result]}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-stone-200" : "text-stone-500"
                          }`}
                        >
                          {formatEntryDate(entry.date)}
                        </span>
                      </span>
                      <span className="block text-lg font-semibold tracking-tight">
                        {formatEntryTitle(entry)}
                      </span>
                      <span
                        className={`block text-sm leading-6 ${
                          isSelected ? "text-stone-200" : "text-stone-600"
                        }`}
                      >
                        {entry.highlight}
                      </span>
                    </span>
                  </button>

                  <div
                    className={`grid gap-2 rounded-2xl px-4 py-3 text-sm ${
                      isSelected
                        ? "bg-white/10 text-stone-100"
                        : "bg-white text-stone-700 ring-1 ring-stone-200"
                    }`}
                  >
                    <p className="font-semibold">{formatScore(entry)}</p>
                    <p>{entry.photos.length}장 첨부</p>
                    <Link
                      href={`/entries/${entry.id}`}
                      className={`font-semibold underline underline-offset-4 ${
                        isSelected
                          ? "text-white hover:text-stone-200"
                          : "text-stone-600 hover:text-stone-950"
                      }`}
                    >
                      상세 보기
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="h-fit rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <p className="text-sm font-medium text-stone-500">선택 요약</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
          {selectedEntryIds.length}개 기록
        </h2>
        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
            <p className="text-xs font-semibold tracking-[0.16em] text-stone-400 uppercase">
              Season
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {selectedSeasonYear ? `${selectedSeasonYear} 시즌` : "미선택"}
            </p>
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
            <p className="text-xs font-semibold tracking-[0.16em] text-stone-400 uppercase">
              Photos
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              첨부 사진 {selectedPhotoCount}장
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-dashed border-stone-200 bg-stone-50/70 px-4 py-4 text-sm leading-7 text-stone-500">
          다음 슬라이스에서 이 선택값을 `selectedEntryIds`로 묶어
          `POST /season-books/estimate` 요청에 연결합니다.
        </div>

        <pre className="mt-4 max-h-56 overflow-auto rounded-[20px] bg-stone-950 px-4 py-4 text-xs leading-6 text-stone-100">
          {JSON.stringify({ selectedEntryIds }, null, 2)}
        </pre>

        <button
          type="button"
          disabled
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-stone-300 px-5 py-3 text-sm font-semibold text-white"
        >
          견적 생성은 다음 단계에서 연결
        </button>
      </aside>
    </div>
  );
}
