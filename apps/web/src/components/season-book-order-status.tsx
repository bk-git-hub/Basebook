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
  SeasonBookShippingInfo,
  SeasonBookStatusSource,
  UpdateSeasonBookShippingRequest,
  UpdateSeasonBookShippingResponse,
} from "@basebook/contracts";

import { ApiClientError } from "@/lib/api/http";
import {
  cancelSeasonBookOrder,
  updateSeasonBookShipping,
} from "@/lib/api/season-books";

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
    badge: "border border-[#dbe6f5] bg-[#eff4fb] text-[#11284f]",
    card: "border-[#dbe6f5] bg-[#fbfdff]",
    line: "bg-[#bfd0e6]",
    marker: "border-[#6f87ab] bg-[#eff4fb] text-[#11284f]",
  },
  current: {
    badge: "bg-[#11284f] text-white",
    card: "border-[#11284f] bg-white shadow-[0_14px_36px_rgba(17,40,79,0.08)]",
    line: "bg-[#7f96b8]",
    marker: "border-[#11284f] bg-[#11284f] text-white",
  },
  pending: {
    badge: "border border-[#e5ecf6] bg-[#f8fbff] text-[#6a7fa1]",
    card: "border-[#e5ecf6] bg-white",
    line: "bg-[#d7e2f0]",
    marker: "border-[#d7e2f0] bg-white text-transparent",
  },
};

type ShippingFormField =
  | "recipientName"
  | "recipientPhone"
  | "postalCode"
  | "address1"
  | "address2"
  | "shippingMemo";

type ShippingFormValues = Record<ShippingFormField, string>;

type ShippingFormErrors = Partial<Record<ShippingFormField, string>>;

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
  orderUid: string | undefined,
  currentOrderStatus: SeasonBookOrderStatusType,
) {
  if (!orderUid) {
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

function canEditShipping(
  orderUid: string | undefined,
  currentOrderStatus: SeasonBookOrderStatusType,
) {
  if (!orderUid) {
    return false;
  }

  return ![
    "UNPLACED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "CANCELLED_REFUND",
    "ERROR",
  ].includes(currentOrderStatus);
}

function getShippingAvailabilityText(status: SeasonBookOrderStatusType) {
  switch (status) {
    case "UNPLACED":
      return "아직 주문이 접수되지 않아 배송지를 수정할 수 없습니다.";
    case "SHIPPED":
      return "배송이 시작된 주문은 이 화면에서 배송지를 변경할 수 없습니다.";
    case "DELIVERED":
      return "배송이 완료된 주문은 배송지 수정 대상이 아닙니다.";
    case "ERROR":
      return "오류 상태 주문은 상태를 다시 확인한 뒤 처리해 주세요.";
    case "CANCELLED":
    case "CANCELLED_REFUND":
      return "취소 처리된 주문은 배송지를 변경할 수 없습니다.";
    default:
      return "현재 주문 상태에서는 배송지 수정이 제한됩니다.";
  }
}

function createShippingFormValues(
  shipping?: SeasonBookShippingInfo,
): ShippingFormValues {
  return {
    recipientName: shipping?.recipientName ?? "",
    recipientPhone: shipping?.recipientPhone ?? "",
    postalCode: shipping?.postalCode ?? "",
    address1: shipping?.address1 ?? "",
    address2: shipping?.address2 ?? "",
    shippingMemo: shipping?.shippingMemo ?? "",
  };
}

function validateShippingValues(
  values: ShippingFormValues,
): ShippingFormErrors {
  const errors: ShippingFormErrors = {};

  if (!values.recipientName.trim()) {
    errors.recipientName = "수령인 이름을 입력해 주세요.";
  }

  if (!values.recipientPhone.trim()) {
    errors.recipientPhone = "수령인 전화번호를 입력해 주세요.";
  }

  if (!values.postalCode.trim()) {
    errors.postalCode = "우편번호를 입력해 주세요.";
  }

  if (!values.address1.trim()) {
    errors.address1 = "기본 주소를 입력해 주세요.";
  }

  return errors;
}

function buildShippingUpdatePayload(
  baseShipping: SeasonBookShippingInfo | undefined,
  values: ShippingFormValues,
): UpdateSeasonBookShippingRequest {
  const payload: UpdateSeasonBookShippingRequest = {};
  const baseValues = createShippingFormValues(baseShipping);
  const nextValues = {
    recipientName: values.recipientName.trim(),
    recipientPhone: values.recipientPhone.trim(),
    postalCode: values.postalCode.trim(),
    address1: values.address1.trim(),
    address2: values.address2.trim(),
    shippingMemo: values.shippingMemo.trim(),
  };

  if (nextValues.recipientName !== baseValues.recipientName) {
    payload.recipientName = nextValues.recipientName;
  }

  if (nextValues.recipientPhone !== baseValues.recipientPhone) {
    payload.recipientPhone = nextValues.recipientPhone;
  }

  if (nextValues.postalCode !== baseValues.postalCode) {
    payload.postalCode = nextValues.postalCode;
  }

  if (nextValues.address1 !== baseValues.address1) {
    payload.address1 = nextValues.address1;
  }

  if (nextValues.address2 !== baseValues.address2) {
    payload.address2 = nextValues.address2;
  }

  if (nextValues.shippingMemo !== baseValues.shippingMemo) {
    payload.shippingMemo = nextValues.shippingMemo;
  }

  return payload;
}

type SeasonBookOrderStatusProps = {
  status: GetSeasonBookStatusResponse;
};

export function SeasonBookOrderStatus({ status }: SeasonBookOrderStatusProps) {
  const router = useRouter();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelResult, setCancelResult] =
    useState<CancelSeasonBookOrderResponse | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [shippingResult, setShippingResult] =
    useState<UpdateSeasonBookShippingResponse | null>(null);
  const [shippingValues, setShippingValues] = useState<ShippingFormValues>(() =>
    createShippingFormValues(status.shipping),
  );
  const [shippingErrors, setShippingErrors] = useState<ShippingFormErrors>({});
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingNotice, setShippingNotice] = useState<string | null>(null);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);

  const effectiveProjectStatus =
    cancelResult?.projectStatus ??
    shippingResult?.projectStatus ??
    status.projectStatus;
  const effectiveOrderStatus =
    cancelResult?.orderStatus ??
    shippingResult?.orderStatus ??
    status.orderStatus;
  const effectiveOrderUid =
    cancelResult?.orderUid ?? shippingResult?.orderUid ?? status.orderUid;
  const effectiveUpdatedAt =
    cancelResult?.cancelledAt ?? shippingResult?.updatedAt ?? status.updatedAt;
  const effectiveShipping = shippingResult?.shipping ?? status.shipping;
  const showCancelledBanner =
    isCancelledOrderStatus(effectiveOrderStatus) && cancelResult;
  const showCancelledState = isCancelledOrderStatus(effectiveOrderStatus);
  const showCancelAction = canCancelOrder(
    effectiveOrderUid,
    effectiveOrderStatus,
  );
  const showShippingAction = canEditShipping(
    effectiveOrderUid,
    effectiveOrderStatus,
  );

  function resetShippingMessages() {
    setShippingError(null);
    setShippingNotice(null);
    setShippingErrors({});
  }

  function openShippingEditor() {
    setShippingValues(createShippingFormValues(effectiveShipping));
    resetShippingMessages();
    setIsEditingShipping(true);
  }

  function closeShippingEditor() {
    setShippingValues(createShippingFormValues(effectiveShipping));
    setShippingErrors({});
    setShippingError(null);
    setIsEditingShipping(false);
  }

  function setShippingFieldValue<K extends ShippingFormField>(
    field: K,
    nextValue: ShippingFormValues[K],
  ) {
    setShippingValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
    setShippingNotice(null);
    setShippingError(null);
    setShippingErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleCancelOrder() {
    setCancelError(null);
    setCancelResult(null);
    setShippingError(null);
    setShippingNotice(null);
    setIsEditingShipping(false);
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

  async function handleShippingSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateShippingValues(shippingValues);
    setShippingErrors(nextErrors);
    setShippingError(null);
    setShippingNotice(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = buildShippingUpdatePayload(
      effectiveShipping,
      shippingValues,
    );

    if (Object.keys(payload).length === 0) {
      setShippingNotice("변경된 배송지 정보가 없습니다.");
      return;
    }

    setIsUpdatingShipping(true);

    try {
      const result = await updateSeasonBookShipping(status.projectId, payload);
      setShippingResult(result);
      setShippingValues(createShippingFormValues(result.shipping));
      setShippingNotice("배송지 정보를 업데이트했습니다.");
      setIsEditingShipping(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setShippingError(error.message);
      } else {
        setShippingError(
          "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsUpdatingShipping(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-[#e5ecf6] bg-white px-6 py-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)] sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
              Order Status
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#5a6f91]">
                주문 진행 상태
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#11284f] sm:text-4xl">
                시즌북 제작이 어디까지 진행됐는지 확인하세요
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[#5a6f91]">
                주문 이후의 제작, 배송 진행 단계를 한 화면에서 확인할 수
                있습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={buildStatusHref(status.projectId)}
              prefetch={false}
              className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
            >
              상태 새로고침
            </Link>
            <Link
              href={buildOrderHref(status.projectId)}
              className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-2.5 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
            >
              주문 화면으로 돌아가기
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
              01 Overview
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
              현재 상태 확인
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
              프로젝트와 주문 상태, 마지막 반영 시점을 먼저 확인합니다.
            </p>
          </article>

          <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
              02 Shipping
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
              배송지 수정
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
              배송 시작 전이라면 이 화면에서 수령인과 주소를 바로 고칠 수
              있습니다.
            </p>
          </article>

          <article className="rounded-[22px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
              03 Progress
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#11284f]">
              제작 단계 추적
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
              결제 이후 제작과 배송이 어디까지 왔는지 단계별로 이어서 봅니다.
            </p>
          </article>
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
        <article className="space-y-4 rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
              현재 요약
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
              마지막으로 확인된 주문 진행 상태와 추적 정보를 보여줍니다.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
                프로젝트 상태
              </p>
              <p className="mt-2 text-base font-semibold text-[#11284f]">
                {PROJECT_STATUS_LABELS[effectiveProjectStatus]}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
                주문 상태
              </p>
              <p className="mt-2 text-base font-semibold text-[#11284f]">
                {ORDER_STATUS_LABELS[effectiveOrderStatus]}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
                상태 기준
              </p>
              <p className="mt-2 text-base font-semibold text-[#11284f]">
                {SOURCE_LABELS[status.source]}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
                최종 갱신
              </p>
              <p className="mt-2 text-base font-semibold text-[#11284f]">
                {formatDateTime(effectiveUpdatedAt)}
              </p>
            </div>
          </div>

          <section className="rounded-[24px] border border-[#dce6f3] bg-[#f8fbff] px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#11284f]">
                  배송지 정보
                </h3>
                <p className="text-sm leading-6 text-[#5a6f91]">
                  현재 배송지 정보를 기준으로 필요한 항목만 바로 수정할 수
                  있습니다.
                </p>
              </div>
              {showShippingAction && !isEditingShipping ? (
                <button
                  type="button"
                  onClick={openShippingEditor}
                  className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
                >
                  배송지 수정
                </button>
              ) : null}
            </div>

            {shippingNotice ? (
              <p className="mt-4 rounded-2xl border border-[#dbe6f5] bg-white px-4 py-3 text-sm leading-6 text-[#11284f]">
                {shippingNotice}
              </p>
            ) : null}

            {shippingError ? (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm leading-6 text-rose-700">
                {shippingError}
              </p>
            ) : null}

            {effectiveShipping ? (
              <dl className="mt-4 grid gap-3 rounded-[24px] border border-[#e5ecf6] bg-white px-4 py-4 text-sm text-[#5a6f91]">
                <div className="flex items-start justify-between gap-4">
                  <dt>수령인</dt>
                  <dd className="text-right font-semibold text-[#11284f]">
                    {effectiveShipping.recipientName}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt>전화번호</dt>
                  <dd className="text-right font-semibold text-[#11284f]">
                    {effectiveShipping.recipientPhone}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt>우편번호</dt>
                  <dd className="text-right font-semibold text-[#11284f]">
                    {effectiveShipping.postalCode}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt>주소</dt>
                  <dd className="max-w-[70%] text-right font-semibold text-[#11284f]">
                    {effectiveShipping.address1}
                    {effectiveShipping.address2
                      ? ` ${effectiveShipping.address2}`
                      : ""}
                  </dd>
                </div>
                {effectiveShipping.shippingMemo ? (
                  <div className="flex items-start justify-between gap-4">
                    <dt>배송 메모</dt>
                    <dd className="max-w-[70%] text-right font-semibold text-[#11284f]">
                      {effectiveShipping.shippingMemo}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-[#dce6f3] bg-white px-4 py-4 text-sm leading-6 text-[#5a6f91]">
                현재 배송지 스냅샷이 없어, 수정 시 전체 배송지를 다시 입력하는
                방식으로 진행됩니다.
              </p>
            )}

            {isEditingShipping ? (
              <form className="mt-4 space-y-4" onSubmit={handleShippingSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[#11284f]">
                      수령인 이름
                    </span>
                    <input
                      type="text"
                      value={shippingValues.recipientName}
                      onChange={(event) =>
                        setShippingFieldValue(
                          "recipientName",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-[#d7e2f0] bg-white px-4 py-3 text-sm text-[#11284f] outline-none transition focus:border-[#11284f]"
                    />
                    {shippingErrors.recipientName ? (
                      <p className="text-sm text-rose-600">
                        {shippingErrors.recipientName}
                      </p>
                    ) : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[#11284f]">
                      전화번호
                    </span>
                    <input
                      type="tel"
                      value={shippingValues.recipientPhone}
                      onChange={(event) =>
                        setShippingFieldValue(
                          "recipientPhone",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-[#d7e2f0] bg-white px-4 py-3 text-sm text-[#11284f] outline-none transition focus:border-[#11284f]"
                    />
                    {shippingErrors.recipientPhone ? (
                      <p className="text-sm text-rose-600">
                        {shippingErrors.recipientPhone}
                      </p>
                    ) : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[#11284f]">
                      우편번호
                    </span>
                    <input
                      type="text"
                      value={shippingValues.postalCode}
                      onChange={(event) =>
                        setShippingFieldValue("postalCode", event.target.value)
                      }
                      className="w-full rounded-2xl border border-[#d7e2f0] bg-white px-4 py-3 text-sm text-[#11284f] outline-none transition focus:border-[#11284f]"
                    />
                    {shippingErrors.postalCode ? (
                      <p className="text-sm text-rose-600">
                        {shippingErrors.postalCode}
                      </p>
                    ) : null}
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-[#11284f]">
                      기본 주소
                    </span>
                    <input
                      type="text"
                      value={shippingValues.address1}
                      onChange={(event) =>
                        setShippingFieldValue("address1", event.target.value)
                      }
                      className="w-full rounded-2xl border border-[#d7e2f0] bg-white px-4 py-3 text-sm text-[#11284f] outline-none transition focus:border-[#11284f]"
                    />
                    {shippingErrors.address1 ? (
                      <p className="text-sm text-rose-600">
                        {shippingErrors.address1}
                      </p>
                    ) : null}
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-[#11284f]">
                      상세 주소
                    </span>
                    <input
                      type="text"
                      value={shippingValues.address2}
                      onChange={(event) =>
                        setShippingFieldValue("address2", event.target.value)
                      }
                      className="w-full rounded-2xl border border-[#d7e2f0] bg-white px-4 py-3 text-sm text-[#11284f] outline-none transition focus:border-[#11284f]"
                    />
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-[#11284f]">
                      배송 메모
                    </span>
                    <textarea
                      rows={3}
                      value={shippingValues.shippingMemo}
                      onChange={(event) =>
                        setShippingFieldValue(
                          "shippingMemo",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-[20px] border border-[#d7e2f0] bg-white px-4 py-3 text-sm leading-6 text-[#11284f] outline-none transition focus:border-[#11284f]"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isUpdatingShipping}
                    className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b] disabled:cursor-not-allowed disabled:bg-[#95a8c6]"
                  >
                    {isUpdatingShipping ? "배송지 저장 중..." : "배송지 저장"}
                  </button>
                  <button
                    type="button"
                    onClick={closeShippingEditor}
                    className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
                  >
                    수정 취소
                  </button>
                </div>
              </form>
            ) : showShippingAction ? (
              <p className="mt-4 text-sm leading-6 text-[#5a6f91]">
                배송 시작 전 상태에서는 배송지 정보를 다시 저장할 수 있습니다.
              </p>
            ) : (
              <p className="mt-4 rounded-2xl border border-[#e5ecf6] bg-white px-4 py-3 text-sm leading-6 text-[#11284f]">
                {getShippingAvailabilityText(effectiveOrderStatus)}
              </p>
            )}
          </section>

          <section className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-rose-900">주문 취소</h3>
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

          <dl className="grid gap-3 rounded-[24px] border border-dashed border-[#dce6f3] bg-[#fbfdff] px-4 py-4 text-sm text-[#5a6f91]">
            <div className="flex items-start justify-between gap-4">
              <dt>프로젝트 ID</dt>
              <dd className="max-w-[70%] break-all text-right font-medium text-[#11284f]">
                {status.projectId}
              </dd>
            </div>
            {status.bookUid ? (
              <div className="flex items-start justify-between gap-4">
                <dt>책 ID</dt>
                <dd className="max-w-[70%] break-all text-right font-medium text-[#11284f]">
                  {status.bookUid}
                </dd>
              </div>
            ) : null}
            {effectiveOrderUid ? (
              <div className="flex items-start justify-between gap-4">
                <dt>주문 ID</dt>
                <dd className="max-w-[70%] break-all text-right font-medium text-[#11284f]">
                  {effectiveOrderUid}
                </dd>
              </div>
            ) : null}
            {status.sweetbookStatusDisplay ? (
              <div className="flex items-start justify-between gap-4">
                <dt>연동 상태</dt>
                <dd className="max-w-[70%] break-all text-right font-medium text-[#11284f]">
                  {status.sweetbookStatusDisplay}
                </dd>
              </div>
            ) : null}
          </dl>
        </article>

        <article className="rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)]">
          {showCancelledState ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
                  취소 처리 상태
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
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
                <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
                  진행 단계
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
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
                          {step.state === "completed"
                            ? "✓"
                            : step.state === "current"
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
                          <h3 className="text-base font-semibold text-[#11284f]">
                            {step.label}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}
                          >
                            {STEP_STATE_LABELS[step.state]}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#5a6f91]">
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
