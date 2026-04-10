type EntryDetailStateCardProps = {
  title: string;
  description: string;
  hint?: string;
};

function EntryDetailStateCard({
  title,
  description,
  hint,
}: EntryDetailStateCardProps) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-sm">
      <div className="max-w-2xl space-y-3">
        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Entry Detail
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

type EntryDetailErrorStateProps = {
  message: string;
  apiBaseUrl: string;
};

export function EntryDetailErrorState({
  message,
  apiBaseUrl,
}: EntryDetailErrorStateProps) {
  return (
    <EntryDetailStateCard
      title="기록 상세를 불러오지 못했습니다"
      description={message}
      hint={`현재 상세 조회 대상 API 주소는 ${apiBaseUrl} 입니다. 백엔드의 GET /entries/:id 구현과 파라미터 처리 상태를 확인해 주세요.`}
    />
  );
}
