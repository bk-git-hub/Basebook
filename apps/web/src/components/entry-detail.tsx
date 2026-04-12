import Link from "next/link";

import type { DiaryEntry, GameResult, TeamCode, WatchType } from "@basebook/contracts";

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
  WIN: "승",
  LOSE: "패",
  DRAW: "무",
  UNKNOWN: "미정",
};

const RESULT_TONE: Record<GameResult, string> = {
  WIN: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  LOSE: "bg-rose-50 text-rose-700 ring-rose-600/15",
  DRAW: "bg-amber-50 text-amber-700 ring-amber-600/15",
  UNKNOWN: "bg-stone-100 text-stone-600 ring-stone-500/10",
};

const WATCH_TYPE_LABELS: Record<WatchType, string> = {
  STADIUM: "직관",
  TV: "TV 시청",
  MOBILE: "모바일 시청",
  OTHER: "기타",
};

function formatEntryDate(date: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(date));
}

function formatEntryDateTime(dateTime: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateTime));
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

type EntryDetailProps = {
  entry: DiaryEntry;
};

export function EntryDetail({ entry }: EntryDetailProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-stone-200 uppercase">
              Entry Detail
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-300">
                {entry.seasonYear} 시즌 · {formatEntryDate(entry.date)}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {TEAM_LABELS[entry.favoriteTeam]} vs{" "}
                {TEAM_LABELS[entry.opponentTeam]}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-stone-300">
                경기 결과와 그날의 감상을 한 화면에서 다시 확인하세요.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${RESULT_TONE[entry.result]}`}
            >
              {RESULT_LABELS[entry.result]}
            </span>
            <Link
              href={`/entries/${entry.id}/edit`}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
            >
              이 기록 수정하기
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                경기 요약
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                경기 결과, 관람 방식, 관람 메모를 한 곳에서 확인합니다.
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-3 text-right ring-1 ring-stone-200">
              <p className="text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                Score
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {formatScore(entry)}
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <dt className="text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                관람 형태
              </dt>
              <dd className="mt-2 text-base font-semibold text-stone-950">
                {WATCH_TYPE_LABELS[entry.watchType]}
              </dd>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <dt className="text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                오늘의 선수
              </dt>
              <dd className="mt-2 text-base font-semibold text-stone-950">
                {entry.playerOfTheDay || "기록 없음"}
              </dd>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <dt className="text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                경기장
              </dt>
              <dd className="mt-2 text-base font-semibold text-stone-950">
                {entry.stadium || "기록 없음"}
              </dd>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <dt className="text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                좌석
              </dt>
              <dd className="mt-2 text-base font-semibold text-stone-950">
                {entry.seat || "기록 없음"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-stone-950">
            기록 정보
          </h2>
          <dl className="mt-6 space-y-4">
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <dt className="text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                생성 시각
              </dt>
              <dd className="mt-2 text-sm font-medium text-stone-700">
                {formatEntryDateTime(entry.createdAt)}
              </dd>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <dt className="text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                마지막 수정
              </dt>
              <dd className="mt-2 text-sm font-medium text-stone-700">
                {formatEntryDateTime(entry.updatedAt)}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              한 줄 감상
            </h2>
            <p className="text-sm leading-6 text-stone-500">
              그날 가장 오래 남은 장면과 자세한 감상을 확인합니다.
            </p>
          </div>
          <p className="mt-6 rounded-[24px] bg-stone-50 px-5 py-5 text-lg leading-8 text-stone-900">
            {entry.highlight}
          </p>
          <div className="mt-4 rounded-[24px] border border-dashed border-stone-200 bg-stone-50/70 px-5 py-5">
            <h3 className="text-sm font-semibold text-stone-800">상세 메모</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
              {entry.rawMemo || "작성된 상세 메모가 없습니다."}
            </p>
          </div>
        </article>

        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              사진
            </h2>
            <p className="text-sm leading-6 text-stone-500">
              첨부된 관람 사진과 업로드 결과를 확인합니다.
            </p>
          </div>

          {entry.photos.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {entry.photos.map((photo) => (
                <li
                  key={photo.id}
                  className="rounded-2xl bg-stone-50 px-4 py-4 ring-1 ring-stone-200"
                >
                  <p className="text-sm font-semibold text-stone-900">
                    {photo.fileName || "첨부 이미지"}
                  </p>
                  <a
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-stone-900"
                  >
                    원본 열기
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-stone-200 bg-stone-50/70 px-5 py-8 text-sm leading-7 text-stone-500">
              첨부된 사진이 없습니다.
            </div>
          )}
        </article>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/season"
          className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          시즌 대시보드로 돌아가기
        </Link>
        <Link
          href={`/entries/${entry.id}/edit`}
          className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
        >
          수정 화면 열기
        </Link>
      </div>
    </div>
  );
}
