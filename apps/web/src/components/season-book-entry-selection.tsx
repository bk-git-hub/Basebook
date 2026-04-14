"use client";

import Link from "next/link";

import type {
  DiaryEntry,
  GameResult,
  TeamCode,
} from "@basebook/contracts";

type SeasonBookEntrySelectionProps = {
  entries: DiaryEntry[];
  selectedEntryIds: string[];
  onChangeSelectedEntryIds: (nextEntryIds: string[]) => void;
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
  WIN: "bg-emerald-100 text-emerald-900 ring-emerald-300/80",
  LOSE: "bg-rose-100 text-rose-900 ring-rose-300/80",
  DRAW: "bg-amber-100 text-amber-900 ring-amber-300/80",
  UNKNOWN: "bg-[#f6f8fb] text-[#6a7d9f] ring-[#dbe4f0]",
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
  selectedEntryIds,
  onChangeSelectedEntryIds,
}: SeasonBookEntrySelectionProps) {
  const selectedEntryIdSet = new Set(selectedEntryIds);

  function toggleEntry(entryId: string) {
    onChangeSelectedEntryIds(
      selectedEntryIds.includes(entryId)
        ? selectedEntryIds.filter((id) => id !== entryId)
        : [...selectedEntryIds, entryId],
    );
  }

  function selectAllEntries() {
    onChangeSelectedEntryIds(entries.map((entry) => entry.id));
  }

  function clearSelection() {
    onChangeSelectedEntryIds([]);
  }

  return (
    <section className="rounded-[30px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)]">
      <div className="flex flex-col gap-4 border-b border-[#e6eef8] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
            select entries
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#11284f]">
            시즌북에 넣을 기록
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
            시즌북에 담고 싶은 경기 기록을 고르세요. 선택한 기록은 오른쪽
            요약에 바로 반영됩니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllEntries}
            className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-4 py-2 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
          >
            전체 선택
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-4 py-2 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
          >
            선택 해제
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {entries.map((entry) => {
          const isSelected = selectedEntryIdSet.has(entry.id);
          const representativePhoto = entry.photos[0];

          return (
            <article
              key={entry.id}
              className={`rounded-[24px] border px-5 py-4 transition ${
                isSelected
                  ? "border-[#11284f] bg-[#11284f] text-white shadow-[0_20px_48px_rgba(17,40,79,0.16)]"
                  : "border-[#e5ecf6] bg-white shadow-[0_12px_30px_rgba(17,40,79,0.04)] hover:border-[#cfdcf0] hover:shadow-[0_18px_38px_rgba(17,40,79,0.08)]"
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
                        ? "border-white bg-white text-[#11284f]"
                        : "border-[#c6d4e8] bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="flex min-w-0 flex-1 items-start justify-between gap-4">
                    <span className="min-w-0 space-y-3">
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
                            isSelected ? "text-[#d9e4f6]" : "text-[#6a7d9f]"
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
                          isSelected ? "text-[#d9e4f6]" : "text-[#4f6488]"
                        }`}
                      >
                        {entry.highlight}
                      </span>
                    </span>

                    {representativePhoto ? (
                      <span
                        className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-[18px] border sm:h-24 sm:w-20 ${
                          isSelected
                            ? "border-white/20 bg-white/10"
                            : "border-[#dce6f3] bg-[#f8fbff]"
                        }`}
                      >
                        <img
                          src={representativePhoto.url}
                          alt={`${formatEntryTitle(entry)} 대표 사진`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </span>
                    ) : null}
                  </span>
                </button>

                <div
                  className={`grid gap-2 rounded-2xl px-4 py-3 text-sm ${
                    isSelected
                      ? "bg-white/10 text-[#eef4ff]"
                      : "bg-[#fbfdff] text-[#4f6488] ring-1 ring-[#e5ecf6]"
                  }`}
                >
                  <p className="font-semibold text-inherit">{formatScore(entry)}</p>
                  <p>{entry.photos.length}장 첨부</p>
                  <Link
                    href={`/entries/${entry.id}`}
                    className={`font-semibold underline underline-offset-4 ${
                      isSelected
                        ? "text-white hover:text-[#d9e4f6]"
                        : "text-[#4f6488] hover:text-[#11284f]"
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
  );
}
