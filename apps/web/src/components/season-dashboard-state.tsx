type SeasonStateProps = {
  title: string;
  description: string;
  hint?: string;
};

function SeasonStateCard({ title, description, hint }: SeasonStateProps) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-sm">
      <div className="max-w-2xl space-y-3">
        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Season Dashboard
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          {title}
        </h1>
        <p className="text-sm leading-7 text-stone-600">{description}</p>
        {hint ? (
          <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-500">
            {hint}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function SeasonDashboardEmptyState() {
  return (
    <SeasonStateCard
      title="표시할 시즌 기록이 아직 없습니다"
      description="첫 직관 기록을 저장하면 승패 요약과 최근 기록이 이 화면에 채워집니다."
      hint="새 기록 작성에서 경기와 사진, 감상을 남겨보세요."
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
      hint="잠시 후 다시 시도해 주세요. 문제가 계속되면 기록 저장 상태를 확인해 보겠습니다."
    />
  );
}
