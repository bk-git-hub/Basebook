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
    <section className="rounded-[30px] border border-[#e5ecf6] bg-white p-8 shadow-[0_18px_48px_rgba(17,40,79,0.05)]">
      <div className="max-w-2xl space-y-4">
        <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
          Order Status
        </span>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-[#11284f]">
            주문 진행 상태를 불러오지 못했습니다
          </h1>
          <p className="text-sm leading-7 text-[#5a6f91]">{message}</p>
          <p className="rounded-2xl border border-[#e5ecf6] bg-[#fbfdff] px-4 py-3 text-sm leading-6 text-[#5a6f91]">
            주문 직후 반영까지 잠시 시간이 걸릴 수 있습니다. 잠시 후 다시 확인해
            주세요.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={buildStatusHref(projectId)}
            prefetch={false}
            className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
          >
            다시 시도하기
          </Link>
          <Link
            href={buildOrderHref(projectId)}
            className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
          >
            주문 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </section>
  );
}
