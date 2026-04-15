import Image from "next/image";
import Link from "next/link";

import type {
  DiaryEntry,
  GameResult,
  TeamCode,
  WatchType,
} from "@basebook/contracts";

import { EntryDetailActions } from "@/components/entry-detail-actions";

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
  WIN: "border-[#d9e4f4] bg-[#eef3fb] text-[#11284f]",
  LOSE: "border-[#f3c9cf] bg-[#fff4f5] text-[#c42d3c]",
  DRAW: "border-[#d9e4f4] bg-[#f8fbff] text-[#5a6f91]",
  UNKNOWN: "border-[#e1e8f3] bg-[#f5f7fb] text-[#6a7d9f]",
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
  const isStadiumVisit = entry.watchType === "STADIUM";
  const summaryTitle = isStadiumVisit ? "직관 요약" : "기록 요약";
  const emptyPhotoCopy = isStadiumVisit
    ? "첨부된 현장 사진이 없습니다."
    : "첨부된 사진이나 캡처가 없습니다.";

  const summaryItems = [
    {
      label: "관람 형태",
      value: WATCH_TYPE_LABELS[entry.watchType],
    },
    {
      label: "오늘의 선수",
      value: entry.playerOfTheDay || "기록 없음",
    },
    ...(isStadiumVisit
      ? [
          {
            label: "경기장",
            value: entry.stadium || "기록 없음",
          },
          {
            label: "좌석",
            value: entry.seat || "기록 없음",
          },
        ]
      : []),
  ];

  const infoItems = [
    {
      label: "생성 시각",
      value: formatEntryDateTime(entry.createdAt),
    },
    {
      label: "마지막 수정",
      value: formatEntryDateTime(entry.updatedAt),
    },
    {
      label: "첨부 사진",
      value: `${entry.photos.length}장`,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[#e5ecf6] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(17,40,79,0.06)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
              Entry Detail
            </span>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#5a6f91]">
                {entry.seasonYear} 시즌 · {formatEntryDate(entry.date)}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#11284f] sm:text-4xl">
                {TEAM_LABELS[entry.favoriteTeam]} vs{" "}
                {TEAM_LABELS[entry.opponentTeam]}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1.5 text-sm font-semibold text-[#11284f]">
                {WATCH_TYPE_LABELS[entry.watchType]}
              </span>
              {isStadiumVisit && entry.stadium ? (
                <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1.5 text-sm font-medium text-[#5a6f91]">
                  {entry.stadium}
                </span>
              ) : null}
              {isStadiumVisit && entry.seat ? (
                <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1.5 text-sm font-medium text-[#5a6f91]">
                  {entry.seat}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 xl:max-w-[18rem] xl:items-end">
            <div className="w-full rounded-[24px] border border-[#e6eef8] bg-[#fbfdff] px-5 py-4 text-left xl:text-right">
              <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-[#6a7d9f] uppercase">
                Score
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-[#11284f]">
                {formatScore(entry)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${RESULT_TONE[entry.result]}`}
              >
                {RESULT_LABELS[entry.result]}
              </span>
              <EntryDetailActions entryId={entry.id} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
        <article className="rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_16px_40px_rgba(17,40,79,0.05)]">
          <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
            {summaryTitle}
          </h2>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-[#e6eef8] bg-[#fbfdff] px-4 py-4"
              >
                <dt className="text-[0.68rem] font-semibold tracking-[0.16em] text-[#6a7d9f] uppercase">
                  {item.label}
                </dt>
                <dd className="mt-2 break-words text-base font-semibold text-[#11284f]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_16px_40px_rgba(17,40,79,0.05)]">
          <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
            기록 정보
          </h2>
          <dl className="mt-6 space-y-4">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-[#e6eef8] bg-[#fbfdff] px-4 py-4"
              >
                <dt className="text-[0.68rem] font-semibold tracking-[0.16em] text-[#6a7d9f] uppercase">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm font-medium text-[#5a6f91]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_1.05fr]">
        <article className="rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_16px_40px_rgba(17,40,79,0.05)]">
          <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
            감상
          </h2>

          <p className="mt-6 rounded-[24px] border border-[#e6eef8] bg-[#fbfdff] px-5 py-5 text-lg leading-8 text-[#11284f]">
            {entry.highlight}
          </p>

          <div className="mt-4 rounded-[24px] border border-dashed border-[#d7e3f2] bg-[#fbfdff] px-5 py-5">
            <h3 className="text-sm font-semibold text-[#11284f]">상세 메모</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5a6f91]">
              {entry.rawMemo || "작성된 상세 메모가 없습니다."}
            </p>
          </div>
        </article>

        <article className="rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_16px_40px_rgba(17,40,79,0.05)]">
          <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
            사진
          </h2>

          {entry.photos.length > 0 ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {entry.photos.map((photo, index) => (
                <li key={photo.id} className="min-w-0">
                  <a
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-[22px] border border-[#e6eef8] bg-[#fbfdff] transition hover:border-[#cfdcf0] hover:bg-white"
                  >
                    <Image
                      src={photo.url}
                      alt={
                        photo.fileName ||
                        `${TEAM_LABELS[entry.favoriteTeam]} 기록 사진 ${index + 1}`
                      }
                      width={960}
                      height={720}
                      unoptimized
                      className="h-44 w-full bg-[#eef3fb] object-cover"
                    />
                    <div className="space-y-2 px-4 py-4">
                      <p className="break-words text-sm font-semibold text-[#11284f]">
                        {photo.fileName || `첨부 이미지 ${index + 1}`}
                      </p>
                      <p className="text-sm font-medium text-[#5a6f91] underline underline-offset-4 group-hover:text-[#11284f]">
                        원본 열기
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-[#d7e3f2] bg-[#fbfdff] px-5 py-8 text-sm leading-7 text-[#5a6f91]">
              {emptyPhotoCopy}
            </div>
          )}
        </article>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/season"
          className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
        >
          시즌 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
