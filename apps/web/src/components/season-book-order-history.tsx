import Link from "next/link";

import type {
  GetSeasonBookOrdersResponse,
  SeasonBookOrderHistoryItem,
  SeasonBookOrderStatus,
  SeasonBookProjectStatus,
} from "@basebook/contracts";

const PROJECT_STATUS_LABELS: Record<SeasonBookProjectStatus, string> = {
  DRAFT: "준비 중",
  ESTIMATED: "견적 완료",
  ORDERED: "주문 완료",
  FAILED: "문제 발생",
};

const ORDER_STATUS_LABELS: Record<SeasonBookOrderStatus, string> = {
  UNPLACED: "주문 전",
  PAID: "결제 완료",
  CONFIRMED: "주문 확인",
  IN_PRODUCTION: "제작 중",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "주문 취소",
  CANCELLED_REFUND: "취소 및 환불 처리",
  ERROR: "처리 오류",
  UNKNOWN: "상태 확인 중",
};

const ORDER_STATUS_STYLES: Record<SeasonBookOrderStatus, string> = {
  UNPLACED: "border border-[#dbe6f5] bg-[#f7faff] text-[#4e6284]",
  PAID: "border border-[#dbe6f5] bg-[#f3f7fc] text-[#173d7a]",
  CONFIRMED: "border border-[#dbe6f5] bg-[#eff4fb] text-[#173d7a]",
  IN_PRODUCTION: "border border-[#dbe6f5] bg-[#eef4ff] text-[#173d7a]",
  SHIPPED: "border border-[#d7e9da] bg-[#edf8ef] text-[#23633a]",
  DELIVERED: "border border-[#d7e9da] bg-[#edf8ef] text-[#23633a]",
  CANCELLED: "border border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED_REFUND: "border border-rose-200 bg-rose-50 text-rose-700",
  ERROR: "border border-amber-200 bg-amber-50 text-amber-800",
  UNKNOWN: "border border-[#e5ecf6] bg-[#fbfdff] text-[#5a6f91]",
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildOrderStatusHref(projectId: string): string {
  return `/order/${encodeURIComponent(projectId)}/status`;
}

function OrderHistoryCard({
  order,
}: {
  order: SeasonBookOrderHistoryItem;
}) {
  return (
    <Link
      href={buildOrderStatusHref(order.projectId)}
      className="group block rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)] transition hover:-translate-y-0.5 hover:border-[#bfd0e6] hover:shadow-[0_22px_56px_rgba(17,40,79,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
              {order.seasonYear} season
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[#11284f]">
              {order.title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold text-[#11284f]">
              {PROJECT_STATUS_LABELS[order.projectStatus]}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[order.orderStatus]}`}
            >
              {ORDER_STATUS_LABELS[order.orderStatus]}
            </span>
          </div>
        </div>

        <span className="mt-1 shrink-0 text-xl text-[#8ca0c2] transition group-hover:translate-x-1 group-hover:text-[#11284f]">
          →
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
          <dt className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
            order
          </dt>
          <dd className="mt-2 break-all text-sm font-semibold text-[#11284f]">
            {order.orderUid}
          </dd>
        </div>
        <div className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
          <dt className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
            book
          </dt>
          <dd className="mt-2 text-sm font-semibold text-[#11284f]">
            {order.bookUid ?? "준비 중"}
          </dd>
        </div>
        <div className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
          <dt className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
            pages
          </dt>
          <dd className="mt-2 text-sm font-semibold text-[#11284f]">
            {order.pageCount ? `${order.pageCount}p` : "미정"}
          </dd>
        </div>
        <div className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
          <dt className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
            price
          </dt>
          <dd className="mt-2 text-sm font-semibold text-[#11284f]">
            {formatPrice(order.totalPrice)} {order.currency}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-col gap-2 text-sm text-[#5a6f91] sm:flex-row sm:items-center sm:justify-between">
        <p>주문 접수 {formatDate(order.createdAt)}</p>
        <p>최근 반영 {formatDateTime(order.updatedAt)}</p>
      </div>
    </Link>
  );
}

export function SeasonBookOrderHistory({
  orderHistory,
}: {
  orderHistory: GetSeasonBookOrdersResponse;
}) {
  return (
    <section className="space-y-4">
      {orderHistory.orders.map((order) => (
        <OrderHistoryCard key={order.projectId} order={order} />
      ))}
    </section>
  );
}

function OrderHistoryStateCard({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="rounded-[28px] border border-[#e5ecf6] bg-white p-8 shadow-[0_18px_48px_rgba(17,40,79,0.06)]">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-[#11284f]">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-7 text-[#5a6f91]">{description}</p>
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

export function SeasonBookOrderHistoryEmptyState() {
  return (
    <OrderHistoryStateCard
      title="아직 주문한 시즌북이 없습니다"
      actionHref="/season-book/new"
      actionLabel="시즌북 만들기"
    />
  );
}

export function SeasonBookOrderHistoryErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <OrderHistoryStateCard
      title="주문 내역을 불러오지 못했습니다"
      description={message}
    />
  );
}
