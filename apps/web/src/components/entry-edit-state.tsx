type EntryEditStateCardProps = {
  title: string;
  description: string;
  hint?: string;
};

function EntryEditStateCard({
  title,
  description,
  hint,
}: EntryEditStateCardProps) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-sm">
      <div className="max-w-2xl space-y-3">
        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Entry Edit
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

type EntryEditErrorStateProps = {
  message: string;
};

export function EntryEditErrorState({
  message,
}: EntryEditErrorStateProps) {
  return (
    <EntryEditStateCard
      title="수정 화면을 준비하지 못했습니다"
      description={message}
      hint="잠시 후 다시 시도하거나, 상세 화면에서 기록을 다시 열어 주세요."
    />
  );
}
