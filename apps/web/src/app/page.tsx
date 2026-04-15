import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import type { DiaryEntry, GameResult, TeamCode } from "@basebook/contracts";

import { HomeSeasonOverview } from "@/components/home-season-overview";
import { HomeStadiumSummary } from "@/components/home-stadium-summary";
import { TeamBadge } from "@/components/team-badge";
import { getEntries } from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";
import { getTeamLabel } from "@/lib/team-meta";

const RECENT_ENTRY_LIMIT = 4;

const RESULT_LABELS: Record<GameResult, string> = {
  WIN: "승",
  LOSE: "패",
  DRAW: "무",
  UNKNOWN: "미정",
};

const RESULT_TONE: Record<GameResult, string> = {
  WIN: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
  LOSE: "bg-rose-100 text-rose-900 ring-1 ring-rose-200",
  DRAW: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  UNKNOWN: "bg-[#f6f8fb] text-[#6a7d9f] ring-1 ring-[#dbe4f0]",
};

const PRIMARY_NAVIGATION = [
  { href: "/about", label: "서비스 알아보기" },
];

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "홈 | Basebook",
  description: "이번 시즌 기록 요약과 최근 일지를 바로 확인하는 Basebook 홈",
};

type HomeSummary = {
  favoriteTeam: TeamCode;
  latestSeasonYear: number;
  seasonEntries: DiaryEntry[];
  recentEntries: DiaryEntry[];
  stadiumEntries: DiaryEntry[];
  wins: number;
  draws: number;
  losses: number;
  trackedGames: number;
  seasonRecordCount: number;
  winRate: number;
};

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

function buildHomeSummary(entries: DiaryEntry[]): HomeSummary | null {
  const sortedEntries = sortEntries(entries);
  const latestEntry = sortedEntries[0];

  if (!latestEntry) {
    return null;
  }

  const latestSeasonYear = latestEntry.seasonYear;
  const seasonEntries = sortedEntries.filter(
    (entry) => entry.seasonYear === latestSeasonYear,
  );
  const recentEntries = sortedEntries.slice(0, RECENT_ENTRY_LIMIT);
  const stadiumEntries = seasonEntries.filter(
    (entry) => entry.watchType === "STADIUM",
  );
  const wins = stadiumEntries.filter((entry) => entry.result === "WIN").length;
  const draws = stadiumEntries.filter((entry) => entry.result === "DRAW").length;
  const losses = stadiumEntries.filter((entry) => entry.result === "LOSE").length;
  const trackedGames = wins + draws + losses;
  const winRate = trackedGames
    ? Math.round((wins / trackedGames) * 100)
    : 0;

  return {
    favoriteTeam: inferFavoriteTeam(seasonEntries),
    latestSeasonYear,
    seasonEntries,
    recentEntries,
    stadiumEntries,
    wins,
    draws,
    losses,
    trackedGames,
    seasonRecordCount: seasonEntries.length,
    winRate,
  };
}

function formatEntryDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(date));
}

function formatCompactDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(date));
}

function formatScore(entry: DiaryEntry) {
  if (
    typeof entry.scoreFor === "number" &&
    typeof entry.scoreAgainst === "number"
  ) {
    return `${entry.scoreFor} : ${entry.scoreAgainst}`;
  }

  return "점수 미기록";
}

function HomeHeader() {
  return (
    <header className="border-b border-[#e6eef8]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:px-10 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="inline-flex items-center gap-3 self-start">
          <Image
            src="/basebook.png"
            alt="Basebook"
            width={112}
            height={112}
            className="h-10 w-10 rounded-[14px] bg-white object-cover sm:h-14 sm:w-14"
          />
          <div>
            <p className="hidden text-[0.68rem] font-semibold tracking-[0.28em] text-[#d53342] uppercase sm:block">
              fan memory book
            </p>
            <p className="text-base font-semibold tracking-[0.16em] text-[#11284f] uppercase sm:text-lg sm:tracking-[0.18em]">
              Basebook
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#4d6284] sm:gap-6">
          {PRIMARY_NAVIGATION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#11284f]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function EmptyHomeState() {
  return (
    <main className="min-h-screen bg-white text-[#11284f]">
      <HomeHeader />
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-24">
        <div className="rounded-[40px] border border-[#e5ecf6] bg-white p-8 shadow-[0_24px_60px_rgba(17,40,79,0.06)] sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_18rem] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center rounded-full border border-[#dce6f3] bg-[#fbfdff] px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                home ready
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-[#11284f] sm:text-5xl">
                첫 직관 기록을 남기면,
                <br />
                이 홈이 시즌 요약으로 채워집니다.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#4e6284] sm:text-lg">
                첫 경기를 남기면 응원 기록과 최근 일지가 이 홈에 쌓입니다.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/entries/new"
                  className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
                >
                  새 일지 남기기
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8]"
                >
                  서비스 알아보기
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#e5ecf6] bg-[#fbfdff] p-5">
              <div className="rounded-[24px] border border-[#edf2f8] bg-white p-4">
                <Image
                  src="/basebook.png"
                  alt="Basebook"
                  width={440}
                  height={440}
                  className="h-auto w-full rounded-[20px] bg-white object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ErrorHomeState({ error }: { error: ApiClientError }) {
  return (
    <main className="min-h-screen bg-white text-[#11284f]">
      <HomeHeader />
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-24">
        <div className="rounded-[36px] border border-[#f1d6da] bg-[#fff7f8] p-8 shadow-[0_20px_60px_rgba(17,40,79,0.05)] sm:p-10">
          <span className="inline-flex rounded-full border border-[#f3c9cf] bg-white px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
            home unavailable
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#11284f] sm:text-4xl">
            시즌 홈을 불러오지 못했어요.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5a6f91]">
            {error.message}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#5a6f91]">
            <span className="rounded-full border border-[#f3d4d8] bg-white px-3 py-1.5">
              HTTP {error.status}
            </span>
            {error.requestId ? (
              <span className="rounded-full border border-[#f3d4d8] bg-white px-3 py-1.5">
                requestId {error.requestId}
              </span>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/entries/new"
              className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
            >
              새 일지 남기기
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8]"
            >
              서비스 알아보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default async function HomePage() {
  try {
    const dashboard = await getEntries();
    const summary = buildHomeSummary(dashboard.entries);

    if (!summary) {
      return <EmptyHomeState />;
    }

    const latestEntry = summary.recentEntries[0];

    return (
      <main className="min-h-screen bg-white text-[#11284f]">
        <HomeHeader />

        <section className="mx-auto max-w-7xl px-5 py-5 sm:px-10 sm:py-14">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)]">
            <div className="order-2 lg:order-none">
              <HomeSeasonOverview
                favoriteTeam={summary.favoriteTeam}
                latestSeasonYear={summary.latestSeasonYear}
                seasonRecordCount={summary.seasonRecordCount}
                stadiumEntryCount={summary.stadiumEntries.length}
                latestEntryDate={formatCompactDate(latestEntry.date)}
              />
            </div>

            <div className="order-1 lg:order-none">
              <HomeStadiumSummary
                wins={summary.wins}
                draws={summary.draws}
                losses={summary.losses}
                trackedGames={summary.trackedGames}
                winRate={summary.winRate}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-10 sm:pb-20">
          <div className="flex flex-col gap-2 border-b border-[#e6eef8] pb-4 sm:flex-row sm:items-end sm:justify-between sm:pb-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
                recent diary
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#11284f] sm:text-3xl">
                최근에 남긴 일지
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6f91] sm:text-base">
                최근 기록 {summary.recentEntries.length}건
              </p>
            </div>
            <Link
              href="/season"
              className="inline-flex items-center justify-center rounded-full border border-[#11284f] bg-white px-4 py-2 text-sm font-semibold text-[#11284f] transition hover:border-[#0b1d3b] hover:bg-[#f8fbff]"
            >
              시즌 기록 전체 보기
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-2">
            {summary.recentEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/entries/${entry.id}`}
                className="rounded-[24px] border border-[#e5ecf6] bg-white p-4 shadow-[0_16px_38px_rgba(17,40,79,0.05)] transition hover:-translate-y-0.5 hover:border-[#cfdcf0] hover:shadow-[0_24px_50px_rgba(17,40,79,0.08)] sm:rounded-[30px] sm:p-5"
              >
                <article>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <TeamBadge team={entry.favoriteTeam} size={60} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${RESULT_TONE[entry.result]}`}
                          >
                            {RESULT_LABELS[entry.result]}
                          </span>
                          <span className="text-sm font-medium text-[#6a7d9f]">
                            {formatEntryDate(entry.date)}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#11284f] sm:mt-3 sm:text-xl">
                          {getTeamLabel(entry.favoriteTeam)} vs{" "}
                          {getTeamLabel(entry.opponentTeam)}
                        </h3>
                      </div>
                    </div>
                    {entry.photos[0] ? (
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[18px] border border-[#d9e4f2] bg-[#f8fbff] sm:h-24 sm:w-20">
                        <img
                          src={entry.photos[0].url}
                          alt={`${getTeamLabel(entry.favoriteTeam)} 경기 대표 사진`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-lg text-[#91a5c5]">→</span>
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#4e6284] sm:mt-5 sm:leading-7">
                    {entry.highlight}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm text-[#5a6f91] sm:mt-5 sm:gap-3">
                    <span className="rounded-full border border-[#e6eef8] bg-[#fbfdff] px-3 py-1.5">
                      {formatScore(entry)}
                    </span>
                    {entry.photos.length > 0 ? (
                      <span className="rounded-full border border-[#e6eef8] bg-[#fbfdff] px-3 py-1.5">
                        사진 {entry.photos.length}장
                      </span>
                    ) : null}
                    {entry.stadium ? (
                      <span className="rounded-full border border-[#e6eef8] bg-[#fbfdff] px-3 py-1.5">
                        {entry.stadium}
                      </span>
                    ) : null}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof ApiClientError) {
      return <ErrorHomeState error={error} />;
    }

    throw error;
  }
}
