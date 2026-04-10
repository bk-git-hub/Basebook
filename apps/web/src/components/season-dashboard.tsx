import type {
  DiaryEntry,
  GameResult,
  GetEntriesResponse,
  TeamCode,
} from "@basebook/contracts";

const RECENT_ENTRY_LIMIT = 4;

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

function formatEntryDate(date: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
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

function getDashboardHeading(entries: DiaryEntry[]) {
  const latestEntry = entries[0];

  if (!latestEntry) {
    return {
      seasonLabel: "시즌 대시보드",
      teamLabel: "응원 팀 미설정",
      helperText: "연동된 /entries 응답을 기반으로 시즌 기록을 정리하는 영역입니다.",
    };
  }

  return {
    seasonLabel: `${latestEntry.seasonYear} 시즌`,
    teamLabel: TEAM_LABELS[latestEntry.favoriteTeam],
    helperText: "GET /entries 응답을 사용해 요약 카드와 최근 기록 리스트를 함께 렌더링합니다.",
  };
}

type SeasonDashboardProps = {
  dashboard: GetEntriesResponse;
};

export function SeasonDashboard({ dashboard }: SeasonDashboardProps) {
  const sortedEntries = [...dashboard.entries].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
  const recentEntries = sortedEntries.slice(0, RECENT_ENTRY_LIMIT);
  const heading = getDashboardHeading(sortedEntries);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-stone-200 uppercase">
            Season Dashboard
          </span>
          <div className="space-y-2">
            <p className="text-sm font-medium text-stone-300">
              {heading.seasonLabel}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading.teamLabel}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-300">
              {heading.helperText}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-stone-500">총 경기 수</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            {dashboard.summary.totalGames}
          </p>
        </article>
        <article className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">승리</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-900">
            {dashboard.summary.wins}
          </p>
        </article>
        <article className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-rose-700">패배</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-rose-900">
            {dashboard.summary.losses}
          </p>
        </article>
        <article className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-amber-700">무승부</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-amber-900">
            {dashboard.summary.draws}
          </p>
        </article>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-stone-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              최근 기록
            </h2>
            <p className="text-sm leading-6 text-stone-500">
              최신 경기 기준 상위 {recentEntries.length}건을 표시합니다.
            </p>
          </div>
          <p className="text-xs font-medium tracking-[0.18em] text-stone-400 uppercase">
            GET /entries
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {recentEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[22px] border border-stone-100 bg-stone-50/80 px-5 py-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${RESULT_TONE[entry.result]}`}
                    >
                      {RESULT_LABELS[entry.result]}
                    </span>
                    <span className="text-sm font-medium text-stone-500">
                      {formatEntryDate(entry.date)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-950">
                    {TEAM_LABELS[entry.favoriteTeam]} vs{" "}
                    {TEAM_LABELS[entry.opponentTeam]}
                  </h3>
                  <p className="text-sm leading-6 text-stone-600">
                    {entry.highlight}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm ring-1 ring-stone-200">
                  <p className="text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                    Final Score
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                    {formatScore(entry)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
