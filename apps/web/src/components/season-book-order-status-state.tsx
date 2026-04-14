import Link from "next/link";

function buildStatusHref(projectId: string) {
  return `/order/${encodeURIComponent(projectId)}/status`;
}

function buildOrderHref(projectId: string) {
  return `/order/${encodeURIComponent(projectId)}`;
}

type SeasonBookOrderStatusErrorStateProps = {
  message: string;
  projectId: string;
};

export function SeasonBookOrderStatusErrorState({
  message,
  projectId,
}: SeasonBookOrderStatusErrorStateProps) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-sm">
      <div className="max-w-2xl space-y-4">
        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Order Status
        </span>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
            주문 진행 상태를 불러오지 못했습니다
          </h1>
          <p className="text-sm leading-7 text-stone-600">{message}</p>
          <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-500">
            주문 직후 반영까지 잠시 시간이 걸릴 수 있습니다. 잠시 후 다시
            확인해 주세요.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={buildStatusHref(projectId)}
            prefetch={false}
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            다시 시도하기
          </Link>
          <Link
            href={buildOrderHref(projectId)}
            className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            주문 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </section>
  );
}
