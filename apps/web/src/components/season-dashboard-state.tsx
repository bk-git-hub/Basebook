import Link from "next/link";

type SeasonStateProps = {
  title: string;
  description?: string;
  hint?: string;
  actionHref?: string;
  actionLabel?: string;
};

function SeasonStateCard({
  title,
  description,
  hint,
  actionHref,
  actionLabel,
}: SeasonStateProps) {
  return (
    <section className="rounded-[28px] border border-[#e5ecf6] bg-white p-8 shadow-[0_18px_48px_rgba(17,40,79,0.06)]">
      <div className="max-w-2xl space-y-3">
        <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
          season dashboard
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#11284f]">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-7 text-[#5a6f91]">{description}</p>
        ) : null}
        {hint ? (
          <p className="rounded-2xl border border-[#e5ecf6] bg-[#fbfdff] px-4 py-3 text-sm leading-6 text-[#5a6f91]">
            {hint}
          </p>
        ) : null}
        {actionHref && actionLabel ? (
          <div className="pt-2">
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
            >
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function SeasonDashboardEmptyState() {
  return (
    <SeasonStateCard
      title="아직 시즌 기록이 없습니다"
      actionHref="/entries/new"
      actionLabel="새 일지 남기기"
    />
  );
}

type SeasonDashboardErrorStateProps = {
  message: string;
};

export function SeasonDashboardErrorState({
  message,
}: SeasonDashboardErrorStateProps) {
  return (
    <SeasonStateCard
      title="시즌 기록을 불러오지 못했습니다"
      description={message}
    />
  );
}
