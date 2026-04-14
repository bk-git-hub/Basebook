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
    <section className="rounded-[28px] border border-[#e5ecf6] bg-white p-8 shadow-[0_16px_40px_rgba(17,40,79,0.05)]">
      <div className="max-w-2xl space-y-3">
        <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
          Entry Detail
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#11284f]">
          {title}
        </h1>
        <p className="text-sm leading-7 text-[#5a6f91]">{description}</p>
        {hint ? (
          <p className="rounded-2xl border border-[#e6eef8] bg-[#fbfdff] px-4 py-3 text-sm leading-6 text-[#5a6f91]">
            {hint}
          </p>
        ) : null}
      </div>
    </section>
  );
}

type EntryDetailErrorStateProps = {
  message: string;
};

export function EntryDetailErrorState({
  message,
}: EntryDetailErrorStateProps) {
  return (
    <EntryDetailStateCard
      title="기록 상세를 불러오지 못했습니다"
      description={message}
      hint="잠시 후 다시 시도하거나, 시즌 대시보드에서 기록을 다시 선택해 주세요."
    />
  );
}
