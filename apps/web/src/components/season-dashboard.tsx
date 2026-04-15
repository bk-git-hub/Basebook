import Image from "next/image";
import Link from "next/link";

import type {
  DiaryEntry,
  GameResult,
  GetEntriesResponse,
  TeamCode,
  WatchType,
} from "@basebook/contracts";

import { TeamBadge } from "@/components/team-badge";
import { formatMonthDay, formatMonthDayWithWeekday } from "@/lib/date-format";
import { getTeamLabel } from "@/lib/team-meta";

const RESULT_LABELS: Record<GameResult, string> = {
  WIN: "승",
  LOSE: "패",
  DRAW: "무",
  UNKNOWN: "미정",
};

const RESULT_TONE: Record<GameResult, string> = {
  WIN: "border-emerald-200 bg-emerald-50 text-emerald-900",
  LOSE: "border-rose-200 bg-rose-50 text-rose-900",
  DRAW: "border-amber-200 bg-amber-50 text-amber-900",
  UNKNOWN: "border-[#e1e8f3] bg-[#f5f7fb] text-[#6a7d9f]",
};

const WATCH_TYPE_LABELS: Record<WatchType, string> = {
  STADIUM: "직관",
  TV: "TV 시청",
  MOBILE: "모바일 시청",
  OTHER: "기타",
};

function formatScore(entry: DiaryEntry): string {
  if (
    typeof entry.scoreFor === "number" &&
    typeof entry.scoreAgainst === "number"
  ) {
    return `${entry.scoreFor} : ${entry.scoreAgainst}`;
  }

  return "점수 미기록";
}

function sortEntries(entries: DiaryEntry[]) {
  return [...entries].sort((left, right) => {
    const dateCompare = right.date.localeCompare(left.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

function inferFavoriteTeam(entries: DiaryEntry[]): TeamCode {
  const counters = new Map<
    TeamCode,
    {
      count: number;
      lastSeen: string;
    }
  >();

  for (const entry of entries) {
    const current = counters.get(entry.favoriteTeam);

    if (!current) {
      counters.set(entry.favoriteTeam, {
        count: 1,
        lastSeen: `${entry.date}-${entry.createdAt}`,
      });
      continue;
    }

    counters.set(entry.favoriteTeam, {
      count: current.count + 1,
      lastSeen:
        `${entry.date}-${entry.createdAt}` > current.lastSeen
          ? `${entry.date}-${entry.createdAt}`
          : current.lastSeen,
    });
  }

  const [favoriteTeam] =
    [...counters.entries()].sort((left, right) => {
      if (right[1].count !== left[1].count) {
        return right[1].count - left[1].count;
      }

      return right[1].lastSeen.localeCompare(left[1].lastSeen);
    })[0] ?? [];

  return favoriteTeam ?? entries[0].favoriteTeam;
}

type SeasonDashboardView = {
  latestSeasonYear: number;
  favoriteTeam: TeamCode;
  latestEntry: DiaryEntry;
  seasonEntries: DiaryEntry[];
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  unknownGames: number;
  stadiumGames: number;
  photoCount: number;
  trackedGames: number;
  winRate: number;
};

function buildSeasonDashboardView(
  entries: DiaryEntry[],
): SeasonDashboardView | null {
  const sortedEntries = sortEntries(entries);
  const latestEntry = sortedEntries[0];

  if (!latestEntry) {
    return null;
  }

  const latestSeasonYear = latestEntry.seasonYear;
  const seasonEntries = sortedEntries.filter(
    (entry) => entry.seasonYear === latestSeasonYear,
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let unknownGames = 0;
  let stadiumGames = 0;
  let photoCount = 0;

  for (const entry of seasonEntries) {
    if (entry.watchType === "STADIUM") {
      stadiumGames += 1;
    }

    photoCount += entry.photos.length;

    switch (entry.result) {
      case "WIN":
        wins += 1;
        break;
      case "LOSE":
        losses += 1;
        break;
      case "DRAW":
        draws += 1;
        break;
      default:
        unknownGames += 1;
    }
  }

  const trackedGames = wins + losses + draws;

  return {
    latestSeasonYear,
    favoriteTeam: inferFavoriteTeam(seasonEntries),
    latestEntry: seasonEntries[0],
    seasonEntries,
    totalGames: seasonEntries.length,
    wins,
    losses,
    draws,
    unknownGames,
    stadiumGames,
    photoCount,
    trackedGames,
    winRate: trackedGames ? Math.round((wins / trackedGames) * 100) : 0,
  };
}

type SeasonDashboardProps = {
  dashboard: GetEntriesResponse;
};

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1.5">
      <span className="text-[0.68rem] font-semibold tracking-[0.18em] text-[#6a7d9f] uppercase">
        {label}
      </span>
      <span className="ml-2 text-sm font-semibold text-[#11284f]">{value}</span>
    </div>
  );
}

function SummaryStatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <article className={`rounded-[24px] border px-4 py-4 sm:px-5 ${className}`}>
      <p className="text-xs font-semibold tracking-[0.18em] uppercase">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-[2rem]">
        {value}
      </p>
    </article>
  );
}

export function SeasonDashboard({ dashboard }: SeasonDashboardProps) {
  const view = buildSeasonDashboardView(dashboard.entries);

  if (!view) {
    return null;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[#e5ecf6] bg-white px-5 py-6 shadow-[0_18px_48px_rgba(17,40,79,0.06)] sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-[24px] border border-[#e5ecf6] bg-[#fbfdff] p-3">
                <TeamBadge team={view.favoriteTeam} size={72} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#5a6f91]">
                  {view.latestSeasonYear} 시즌
                </p>
                <h1 className="mt-1 text-[1.9rem] font-semibold tracking-tight text-[#11284f] sm:text-[2.4rem]">
                  {getTeamLabel(view.favoriteTeam)}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <InfoChip
                label="최근 기록"
                value={formatMonthDay(view.latestEntry.date)}
              />
              <InfoChip label="직관" value={`${view.stadiumGames}경기`} />
              <InfoChip label="사진" value={`${view.photoCount}장`} />
            </div>
          </div>

          <aside className="rounded-[28px] border border-[#e5ecf6] bg-[#fbfdff] p-4 sm:p-5 xl:max-w-xs">
            <p className="text-sm font-semibold text-[#5a6f91]">직관 승률</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#11284f] sm:text-[2.2rem]">
              {view.trackedGames > 0 ? `${view.winRate}%` : "-"}
            </p>
            <p className="mt-2 text-sm font-medium text-[#5a6f91]">
              {view.trackedGames > 0
                ? `${view.wins}승 ${view.draws}무 ${view.losses}패`
                : "승무패 기록 없음"}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row xl:flex-col">
              <Link
                href="/entries/new"
                className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
              >
                새 일지 남기기
              </Link>
              <Link
                href="/season-book/new"
                className="inline-flex items-center justify-center rounded-full border border-[#11284f] bg-white px-4 py-2.5 text-sm font-semibold text-[#11284f] transition hover:bg-[#f8fbff]"
              >
                시즌북 제작
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            label="시즌 기록"
            value={`${view.totalGames}건`}
            className="border-[#e5ecf6] bg-[#fbfdff] text-[#11284f]"
          />
          <SummaryStatCard
            label="승리"
            value={`${view.wins}`}
            className="border-emerald-200 bg-emerald-50 text-emerald-950"
          />
          <SummaryStatCard
            label="패배"
            value={`${view.losses}`}
            className="border-rose-200 bg-rose-50 text-rose-950"
          />
          <SummaryStatCard
            label="무승부"
            value={`${view.draws}`}
            className="border-amber-200 bg-amber-50 text-amber-950"
          />
        </div>

        {view.unknownGames > 0 ? (
          <p className="rounded-[22px] border border-[#e5ecf6] bg-white px-4 py-3 text-sm font-medium text-[#5a6f91]">
            미정 {view.unknownGames}건 제외
          </p>
        ) : null}
      </section>

      <section className="rounded-[30px] border border-[#e5ecf6] bg-white p-5 shadow-[0_18px_48px_rgba(17,40,79,0.06)] sm:p-6">
        <div className="flex flex-col gap-2 border-b border-[#edf2f8] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-[#11284f] sm:text-2xl">
            전체 기록
          </h2>
          <p className="text-sm font-medium text-[#5a6f91]">
            전체 {view.totalGames}건
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {view.seasonEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/entries/${entry.id}`}
              className="group block rounded-[24px] border border-[#e7eef8] bg-[#fbfdff] px-4 py-4 transition hover:border-[#cfdaea] hover:bg-white hover:shadow-[0_18px_32px_rgba(17,40,79,0.06)] sm:px-5"
            >
              <article className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${RESULT_TONE[entry.result]}`}
                  >
                    {RESULT_LABELS[entry.result]}
                  </span>
                  <span className="inline-flex rounded-full border border-[#dce6f3] bg-white px-2.5 py-1 text-xs font-semibold text-[#5a6f91]">
                    {WATCH_TYPE_LABELS[entry.watchType]}
                  </span>
                  <span className="text-sm font-medium text-[#5a6f91]">
                    {formatMonthDayWithWeekday(entry.date)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="text-base font-semibold tracking-tight text-[#11284f] sm:text-lg">
                      {getTeamLabel(entry.favoriteTeam)} vs{" "}
                      {getTeamLabel(entry.opponentTeam)}
                    </h3>
                    <p className="text-sm leading-6 text-[#4e6284]">
                      {entry.highlight}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-[#5a6f91]">
                      <span className="rounded-full border border-[#dce6f3] bg-white px-2.5 py-1">
                        점수 {formatScore(entry)}
                      </span>
                      {entry.playerOfTheDay ? (
                        <span className="rounded-full border border-[#dce6f3] bg-white px-2.5 py-1">
                          오늘의 선수 {entry.playerOfTheDay}
                        </span>
                      ) : null}
                      {entry.watchType === "STADIUM" && entry.stadium ? (
                        <span className="rounded-full border border-[#dce6f3] bg-white px-2.5 py-1">
                          {entry.stadium}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {entry.photos[0] ? (
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[18px] border border-[#dbe4f0] bg-white sm:h-24 sm:w-20">
                      <Image
                        src={entry.photos[0].url}
                        alt={`${getTeamLabel(entry.favoriteTeam)} 경기 대표 사진`}
                        fill
                        unoptimized
                        sizes="(min-width: 640px) 80px, 64px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#edf2f8] pt-3 text-sm text-[#5a6f91]">
                  <span>
                    {entry.photos.length > 0
                      ? `사진 ${entry.photos.length}장`
                      : "사진 없음"}
                  </span>
                  <span className="font-semibold text-[#11284f] transition group-hover:text-[#0b1d3b]">
                    상세 보기
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
