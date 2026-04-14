"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  SeasonBookOrderRequest,
  SeasonBookOrderResponse,
} from "@basebook/contracts";

import { ApiClientError } from "@/lib/api/http";
import { createSeasonBookOrder } from "@/lib/api/season-books";

export type OrderEstimateSummary = {
  pageCount: number;
  totalPrice: number;
  currency: "KRW";
  creditSufficient?: boolean;
};

type SeasonBookOrderFormProps = {
  estimateSummary?: OrderEstimateSummary;
  projectId: string;
};

type OrderFormField =
  | "recipientName"
  | "recipientPhone"
  | "postalCode"
  | "address1"
  | "address2";

type OrderFormValues = Record<OrderFormField, string>;

type OrderFormErrors = Partial<Record<OrderFormField, string>>;

const INITIAL_VALUES: OrderFormValues = {
  recipientName: "",
  recipientPhone: "",
  postalCode: "",
  address1: "",
  address2: "",
};

function toOptionalString(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

function buildOrderInput(
  projectId: string,
  values: OrderFormValues,
): SeasonBookOrderRequest {
  return {
    projectId,
    recipientName: values.recipientName.trim(),
    recipientPhone: values.recipientPhone.trim(),
    postalCode: values.postalCode.trim(),
    address1: values.address1.trim(),
    address2: toOptionalString(values.address2),
  };
}

function validateValues(values: OrderFormValues): OrderFormErrors {
  const errors: OrderFormErrors = {};

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

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function buildOrderStatusHref(projectId: string) {
  return `/order/${encodeURIComponent(projectId)}/status`;
}

export function SeasonBookOrderForm({
  estimateSummary,
  projectId,
}: SeasonBookOrderFormProps) {
  const [values, setValues] = useState<OrderFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<OrderFormErrors>({});
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderResult, setOrderResult] =
    useState<SeasonBookOrderResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setFieldValue<K extends OrderFormField>(
    field: K,
    nextValue: OrderFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
    setOrderResult(null);
    setOrderError(null);
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateValues(values);
    setFieldErrors(nextErrors);
    setOrderError(null);
    setOrderResult(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderInput = buildOrderInput(projectId, values);
      const response = await createSeasonBookOrder(orderInput);
      setOrderResult(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setOrderError(error.message);
      } else {
        setOrderError(
          "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      onSubmit={handleSubmit}
    >
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="border-b border-stone-100 pb-5">
          <h2 className="text-xl font-semibold tracking-tight text-stone-950">
            배송 정보
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            시즌북을 받을 수령인과 주소를 입력해 주세요.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-800">
              수령인 이름
            </span>
            <input
              type="text"
              value={values.recipientName}
              onChange={(event) =>
                setFieldValue("recipientName", event.target.value)
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
            />
            {fieldErrors.recipientName ? (
              <p className="text-sm text-rose-600">
                {fieldErrors.recipientName}
              </p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-800">
              전화번호
            </span>
            <input
              type="tel"
              value={values.recipientPhone}
              onChange={(event) =>
                setFieldValue("recipientPhone", event.target.value)
              }
              placeholder="010-0000-0000"
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
            />
            {fieldErrors.recipientPhone ? (
              <p className="text-sm text-rose-600">
                {fieldErrors.recipientPhone}
              </p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-800">
              우편번호
            </span>
            <input
              type="text"
              value={values.postalCode}
              onChange={(event) =>
                setFieldValue("postalCode", event.target.value)
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
            />
            {fieldErrors.postalCode ? (
              <p className="text-sm text-rose-600">{fieldErrors.postalCode}</p>
            ) : null}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-stone-800">
              기본 주소
            </span>
            <input
              type="text"
              value={values.address1}
              onChange={(event) => setFieldValue("address1", event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
            />
            {fieldErrors.address1 ? (
              <p className="text-sm text-rose-600">{fieldErrors.address1}</p>
            ) : null}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-stone-800">
              상세 주소
            </span>
            <input
              type="text"
              value={values.address2}
              onChange={(event) => setFieldValue("address2", event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
            />
          </label>
        </div>
      </section>

      <aside className="h-fit space-y-6 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <div>
          <p className="text-sm font-medium text-stone-500">주문 대상</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            견적 확인 완료
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            이전 단계에서 만든 시즌북 견적을 바탕으로 주문을 이어갑니다.
          </p>
        </div>

        {estimateSummary ? (
          <section className="space-y-4 rounded-[24px] border border-stone-200 bg-stone-50/80 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">
                주문 전 확인
              </p>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                배송 정보를 입력하기 전에 제작 분량과 예상 금액을 다시 확인하세요.
              </p>
            </div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200">
                <dt className="text-sm text-stone-500">페이지 수</dt>
                <dd className="font-semibold text-stone-950">
                  {estimateSummary.pageCount}p
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200">
                <dt className="text-sm text-stone-500">예상 금액</dt>
                <dd className="font-semibold text-stone-950">
                  {formatPrice(estimateSummary.totalPrice)}{" "}
                  {estimateSummary.currency}
                </dd>
              </div>
              {typeof estimateSummary.creditSufficient === "boolean" ? (
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200">
                  <dt className="text-sm text-stone-500">크레딧</dt>
                  <dd className="font-semibold text-stone-950">
                    {estimateSummary.creditSufficient ? "사용 가능" : "부족"}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : (
          <section className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
            견적 정보를 다시 확인하려면 견적 화면에서 주문 화면으로 이동해 주세요.
          </section>
        )}

        {orderError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {orderError}
          </p>
        ) : null}

        {orderResult ? (
          <div className="space-y-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
            <p className="font-semibold">주문이 접수되었습니다.</p>
            <dl className="grid gap-2">
              <div className="flex justify-between gap-4">
                <dt>주문 ID</dt>
                <dd className="break-all text-right font-semibold">
                  {orderResult.orderUid}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>금액</dt>
                <dd className="font-semibold">
                  {formatPrice(orderResult.totalPrice)} {orderResult.currency}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>주문 상태</dt>
                <dd className="font-semibold">{orderResult.orderStatus}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>프로젝트 상태</dt>
                <dd className="font-semibold">{orderResult.projectStatus}</dd>
              </div>
            </dl>
            <Link
              href={buildOrderStatusHref(orderResult.projectId)}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              주문 진행 상태 보기
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {isSubmitting ? "주문 접수 중..." : "시즌북 주문 접수"}
        </button>

        <Link
          href="/season-book/new"
          className="inline-flex w-full items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
        >
          견적 화면으로 돌아가기
        </Link>
      </aside>
    </form>
  );
}
