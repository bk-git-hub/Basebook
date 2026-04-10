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
      description="`GET /entries` 호출은 성공했지만 아직 대시보드에 그릴 기록이 비어 있습니다. 백엔드 seed 데이터나 사용자의 첫 기록 생성이 준비되면 이 영역이 자동으로 채워집니다."
      hint="다음 연동 대상인 POST /entries가 준비되면 이 빈 상태를 실제 생성 흐름으로 자연스럽게 연결할 수 있습니다."
    />
  );
}

type SeasonDashboardErrorStateProps = {
  message: string;
  apiBaseUrl: string;
};

export function SeasonDashboardErrorState({
  message,
  apiBaseUrl,
}: SeasonDashboardErrorStateProps) {
  return (
    <SeasonStateCard
      title="시즌 기록을 불러오지 못했습니다"
      description={message}
      hint={`현재 조회 대상으로 설정된 API 주소는 ${apiBaseUrl} 입니다. 백엔드 서버가 실행 중인지, 그리고 GET /entries 구현이 준비됐는지 먼저 확인해 주세요.`}
    />
  );
}
