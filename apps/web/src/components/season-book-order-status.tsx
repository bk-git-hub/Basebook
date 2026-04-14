"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import type {
  CancelSeasonBookOrderResponse,
  GetSeasonBookStatusResponse,
  SeasonBookOrderStatus as SeasonBookOrderStatusType,
  SeasonBookProgressStepState,
  SeasonBookProjectStatus,
  SeasonBookStatusSource,
} from "@basebook/contracts";

import { ApiClientError } from "@/lib/api/http";
import { cancelSeasonBookOrder } from "@/lib/api/season-books";

const PROJECT_STATUS_LABELS: Record<SeasonBookProjectStatus, string> = {
  DRAFT: "준비 중",
  ESTIMATED: "견적 완료",
  ORDERED: "주문 완료",
  FAILED: "문제 발생",
};

const ORDER_STATUS_LABELS: Record<SeasonBookOrderStatusType, string> = {
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

const SOURCE_LABELS: Record<SeasonBookStatusSource, string> = {
  LOCAL: "로컬 상태",
  SWEETBOOK: "Sweetbook 상태",
};

const STEP_STATE_LABELS: Record<SeasonBookProgressStepState, string> = {
  completed: "완료",
  current: "진행 중",
  pending: "대기",
};

const STEP_STATE_STYLES: Record<
  SeasonBookProgressStepState,
  {
    badge: string;
    card: string;
    line: string;
    marker: string;
  }
> = {
  completed: {
    badge: "bg-emerald-100 text-emerald-800",
    card: "border-emerald-200 bg-emerald-50/80",
    line: "bg-emerald-300",
    marker: "border-emerald-700 bg-emerald-700 text-white",
  },
  current: {
    badge: "bg-stone-950 text-white",
    card: "border-stone-950 bg-white",
    line: "bg-stone-300",
    marker: "border-stone-950 bg-stone-950 text-white",
  },
  pending: {
    badge: "bg-stone-100 text-stone-600",
    card: "border-stone-200 bg-stone-50/80",
    line: "bg-stone-200",
    marker: "border-stone-300 bg-white text-transparent",
  },
};

function formatDateTime(value?: string) {
  if (!value) {
    return "기록 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function buildStatusHref(projectId: string) {
  return `/order/${encodeURIComponent(projectId)}/status`;
}

function buildOrderHref(projectId: string) {
  return `/order/${encodeURIComponent(projectId)}`;
}

function isCancelledOrderStatus(status: SeasonBookOrderStatusType) {
  return status === "CANCELLED" || status === "CANCELLED_REFUND";
}

function canCancelOrder(
  status: GetSeasonBookStatusResponse,
  currentOrderStatus: SeasonBookOrderStatusType,
) {
  if (!status.orderUid) {
    return false;
  }

  return ![
    "UNPLACED",
    "DELIVERED",
    "CANCELLED",
    "CANCELLED_REFUND",
    "ERROR",
  ].includes(currentOrderStatus);
}

function getCancelAvailabilityText(status: SeasonBookOrderStatusType) {
  switch (status) {
    case "UNPLACED":
      return "아직 주문이 접수되지 않아 취소할 대상이 없습니다.";
    case "DELIVERED":
      return "배송이 완료된 주문은 이 화면에서 취소할 수 없습니다.";
    case "ERROR":
      return "오류 상태 주문은 상태를 다시 확인한 뒤 처리해 주세요.";
    case "CANCELLED":
    case "CANCELLED_REFUND":
      return "이미 취소 처리된 주문입니다.";
    default:
      return "취소 가능한 주문 상태가 아닙니다.";
  }
}

function getCancelBannerTitle(status: SeasonBookOrderStatusType) {
  return status === "CANCELLED_REFUND"
    ? "주문 취소와 환불 처리가 반영되었습니다"
    : "주문 취소가 반영되었습니다";
}

type SeasonBookOrderStatusProps = {
  status: GetSeasonBookStatusResponse;
};

export function SeasonBookOrderStatus({
  status,
}: SeasonBookOrderStatusProps) {
  const router = useRouter();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelResult, setCancelResult] =
    useState<CancelSeasonBookOrderResponse | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const effectiveProjectStatus =
    cancelResult?.projectStatus ?? status.projectStatus;
  const effectiveOrderStatus = cancelResult?.orderStatus ?? status.orderStatus;
  const effectiveOrderUid = cancelResult?.orderUid ?? status.orderUid;
  const effectiveUpdatedAt = cancelResult?.cancelledAt ?? status.updatedAt;
  const showCancelledBanner =
    isCancelledOrderStatus(effectiveOrderStatus) && cancelResult;
  const showCancelledState = isCancelledOrderStatus(effectiveOrderStatus);
  const showCancelAction = canCancelOrder(status, effectiveOrderStatus);

  async function handleCancelOrder() {
    setCancelError(null);
    setCancelResult(null);
    setIsCancelling(true);

    try {
      const result = await cancelSeasonBookOrder(status.projectId);
      setCancelResult(result);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setCancelError(error.message);
      } else {
        setCancelError(
          "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-stone-200 uppercase">
              Order Status
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-300">
                주문 진행 상태
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                시즌북 제작이 어디까지 진행됐는지 확인하세요
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-stone-300">
                주문 이후의 제작, 배송 진행 단계를 한 화면에서 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={buildStatusHref(status.projectId)}
              prefetch={false}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
            >
              상태 새로고침
            </Link>
            <Link
              href={buildOrderHref(status.projectId)}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              주문 화면으로 돌아가기
            </Link>
          </div>
        </div>
      </section>

      {showCancelledBanner ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-rose-900 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">
              {getCancelBannerTitle(effectiveOrderStatus)}
            </h2>
            <p className="text-sm leading-6 text-rose-800">
              {cancelResult?.cancelledAt
                ? `${formatDateTime(cancelResult.cancelledAt)} 기준으로 주문 취소 응답을 받았습니다.`
                : "주문 취소 응답을 받았습니다."}
            </p>
            {typeof cancelResult?.refundAmount === "number" ? (
              <p className="text-sm font-medium text-rose-900">
                환불 금액 {formatPrice(cancelResult.refundAmount)}원이 함께
                기록되었습니다.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              현재 요약
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              마지막으로 확인된 주문 진행 상태와 추적 정보를 보여줍니다.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl bg-stone-50 px-4 py-4 ring-1 ring-stone-200">
              <p className="text-xs font-semibold tracking-[0.16em] text-stone-400 uppercase">
                프로젝트 상태
              </p>
              <p className="mt-2 text-base font-semibold text-stone-950">
                {PROJECT_STATUS_LABELS[effectiveProjectStatus]}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4 ring-1 ring-stone-200">
              <p className="text-xs font-semibold tracking-[0.16em] text-stone-400 uppercase">
                주문 상태
              </p>
              <p className="mt-2 text-base font-semibold text-stone-950">
                {ORDER_STATUS_LABELS[effectiveOrderStatus]}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4 ring-1 ring-stone-200">
              <p className="text-xs font-semibold tracking-[0.16em] text-stone-400 uppercase">
                상태 기준
              </p>
              <p className="mt-2 text-base font-semibold text-stone-950">
                {SOURCE_LABELS[status.source]}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4 ring-1 ring-stone-200">
              <p className="text-xs font-semibold tracking-[0.16em] text-stone-400 uppercase">
                최종 갱신
              </p>
              <p className="mt-2 text-base font-semibold text-stone-950">
                {formatDateTime(effectiveUpdatedAt)}
              </p>
            </div>
          </div>

          <section className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-rose-900">
                주문 취소
              </h3>
              <p className="text-sm leading-6 text-rose-800">
                이 화면에서는 취소 사유를 따로 묻지 않고 바로 취소 요청을
                보냅니다.
              </p>
            </div>

            {showCancelAction ? (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {isCancelling ? "주문 취소 요청 중..." : "주문 바로 취소"}
              </button>
            ) : (
              <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm leading-6 text-rose-900 ring-1 ring-rose-200">
                {getCancelAvailabilityText(effectiveOrderStatus)}
              </p>
            )}

            {cancelError ? (
              <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm leading-6 text-rose-900 ring-1 ring-rose-200">
                {cancelError}
              </p>
            ) : null}
          </section>

          <dl className="grid gap-3 rounded-[24px] border border-dashed border-stone-200 bg-stone-50/70 px-4 py-4 text-sm text-stone-600">
            <div className="flex items-start justify-between gap-4">
              <dt>프로젝트 ID</dt>
              <dd className="max-w-[70%] break-all text-right font-medium text-stone-800">
                {status.projectId}
              </dd>
            </div>
            {status.bookUid ? (
              <div className="flex items-start justify-between gap-4">
                <dt>책 ID</dt>
                <dd className="max-w-[70%] break-all text-right font-medium text-stone-800">
                  {status.bookUid}
                </dd>
              </div>
            ) : null}
            {effectiveOrderUid ? (
              <div className="flex items-start justify-between gap-4">
                <dt>주문 ID</dt>
                <dd className="max-w-[70%] break-all text-right font-medium text-stone-800">
                  {effectiveOrderUid}
                </dd>
              </div>
            ) : null}
            {status.sweetbookStatusDisplay ? (
              <div className="flex items-start justify-between gap-4">
                <dt>연동 상태</dt>
                <dd className="max-w-[70%] break-all text-right font-medium text-stone-800">
                  {status.sweetbookStatusDisplay}
                </dd>
              </div>
            ) : null}
          </dl>
        </article>

        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          {showCancelledState ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                  취소 처리 상태
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  취소가 반영된 주문은 제작 단계 대신 취소 결과를 중심으로
                  확인합니다.
                </p>
              </div>

              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-5">
                <p className="text-sm font-semibold text-rose-900">
                  {getCancelBannerTitle(effectiveOrderStatus)}
                </p>
                <p className="mt-3 text-sm leading-6 text-rose-800">
                  {cancelResult?.cancelledAt
                    ? `${formatDateTime(cancelResult.cancelledAt)} 기준으로 주문이 취소되었습니다.`
                    : "상태 조회 기준으로 주문이 취소된 상태입니다."}
                </p>
                {typeof cancelResult?.refundAmount === "number" ? (
                  <p className="mt-3 text-sm font-medium text-rose-900">
                    환불 금액 {formatPrice(cancelResult.refundAmount)}원이 함께
                    기록되었습니다.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                  진행 단계
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  현재 단계는 강조되고, 지난 단계와 남은 단계가 한눈에
                  구분됩니다.
                </p>
              </div>

              <ol className="mt-6 space-y-4">
                {status.progress.map((step, index) => {
                  const tone = STEP_STATE_STYLES[step.state];
                  const isLast = index === status.progress.length - 1;

                  return (
                    <li
                      key={step.key}
                      className="grid grid-cols-[1.5rem_1fr] gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`mt-1 flex size-6 items-center justify-center rounded-full border text-xs font-bold ${tone.marker}`}
                        >
                          {step.state === "completed" ||
                          step.state === "current"
                            ? "•"
                            : " "}
                        </span>
                        {!isLast ? (
                          <span className={`mt-2 w-px flex-1 ${tone.line}`} />
                        ) : null}
                      </div>

                      <div
                        className={`rounded-[24px] border px-5 py-4 ${tone.card}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-base font-semibold text-stone-950">
                            {step.label}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}
                          >
                            {STEP_STATE_LABELS[step.state]}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-stone-600">
                          {step.occurredAt
                            ? formatDateTime(step.occurredAt)
                            : step.state === "pending"
                              ? "아직 시작 전 단계입니다."
                              : "최근 갱신 시점에 이 단계로 확인되었습니다."}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
