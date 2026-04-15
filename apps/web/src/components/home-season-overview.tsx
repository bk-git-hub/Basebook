import Link from "next/link";

import type { TeamCode } from "@basebook/contracts";

import { TeamBadge } from "@/components/team-badge";
import { getTeamLabel } from "@/lib/team-meta";

type HomeSeasonOverviewProps = {
  favoriteTeam: TeamCode;
  latestSeasonYear: number;
  seasonRecordCount: number;
  stadiumEntryCount: number;
  latestEntryDate: string;
};

function SummaryMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-[24px] border border-[#e5ecf6] bg-[#fbfdff] px-5 py-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-[#6a7d9f] uppercase">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#11284f]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#6a7d9f]">{helper}</p>
    </article>
  );
}

export function HomeSeasonOverview({
  favoriteTeam,
  latestSeasonYear,
  seasonRecordCount,
  stadiumEntryCount,
  latestEntryDate,
}: HomeSeasonOverviewProps) {
  return (
    <>
      <section className="rounded-[28px] border border-[#e5ecf6] bg-white p-5 shadow-[0_16px_40px_rgba(17,40,79,0.05)] md:hidden">
        <div className="flex items-center gap-3">
          <TeamBadge team={favoriteTeam} size={68} />
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
              season home
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#11284f]">
              {getTeamLabel(favoriteTeam)}
            </h1>
            <p className="mt-1 text-sm leading-6 text-[#5a6f91]">
              {latestSeasonYear} 시즌 요약
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-[18px] border border-[#e6eef8] bg-[#fbfdff] px-3 py-3 text-center">
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-[#6a7d9f] uppercase">
              기록
            </p>
            <p className="mt-1.5 text-lg font-semibold tracking-tight text-[#11284f]">
              {seasonRecordCount}건
            </p>
          </div>
          <div className="rounded-[18px] border border-[#e6eef8] bg-[#fbfdff] px-3 py-3 text-center">
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-[#6a7d9f] uppercase">
              직관
            </p>
            <p className="mt-1.5 text-lg font-semibold tracking-tight text-[#11284f]">
              {stadiumEntryCount}경기
            </p>
          </div>
          <div className="rounded-[18px] border border-[#e6eef8] bg-[#fbfdff] px-3 py-3 text-center">
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-[#6a7d9f] uppercase">
              최근
            </p>
            <p className="mt-1.5 text-lg font-semibold tracking-tight text-[#11284f]">
              {latestEntryDate}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link
            href="/entries/new"
            className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap text-white transition hover:bg-[#0b1d3b]"
          >
            새 일지 남기기
          </Link>
          <Link
            href="/season-book/new"
            className="inline-flex items-center justify-center rounded-full border border-[#11284f] bg-white px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap text-[#11284f] transition hover:bg-[#f8fbff]"
          >
            시즌북 제작
          </Link>
          <Link
            href="/order"
            className="inline-flex items-center justify-center rounded-full border border-[#11284f] bg-white px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap text-[#11284f] transition hover:bg-[#f8fbff]"
          >
            주문 내역
          </Link>
        </div>
      </section>

      <section className="hidden rounded-[36px] border border-[#e5ecf6] bg-white p-8 shadow-[0_24px_60px_rgba(17,40,79,0.06)] sm:p-10 md:block">
        <span className="inline-flex items-center rounded-full border border-[#dce6f3] bg-[#fbfdff] px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
          season home
        </span>
        <div className="mt-6 space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-[#11284f] sm:text-5xl">
            이번 시즌 기록 요약
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[#4e6284] sm:text-lg">
            응원 팀과 직관 흐름, 최근 일지가 한눈에 보입니다.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-4 rounded-[30px] border border-[#e5ecf6] bg-[#fbfdff] p-5">
          <TeamBadge team={favoriteTeam} size={84} />
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#6a7d9f] uppercase">
              favorite team
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#11284f] sm:text-3xl">
              {getTeamLabel(favoriteTeam)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
              {latestSeasonYear} 시즌에 가장 많이 남긴 응원 팀
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryMetric
            label="시즌 기록"
            value={`${seasonRecordCount}건`}
            helper={`${latestSeasonYear} 시즌 기록`}
          />
          <SummaryMetric
            label="직관 경기"
            value={`${stadiumEntryCount}경기`}
            helper="직관으로 남긴 경기"
          />
          <SummaryMetric
            label="최근 업데이트"
            value={latestEntryDate}
            helper="가장 최근 일지"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/entries/new"
            className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
          >
            새 일지 남기기
          </Link>
          <Link
            href="/season-book/new"
            className="inline-flex items-center justify-center rounded-full border border-[#11284f] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:border-[#0b1d3b] hover:bg-[#f8fbff]"
          >
            시즌북 제작
          </Link>
          <Link
            href="/order"
            className="inline-flex items-center justify-center rounded-full border border-[#11284f] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:border-[#0b1d3b] hover:bg-[#f8fbff]"
          >
            주문 내역
          </Link>
        </div>
      </section>
    </>
  );
}
