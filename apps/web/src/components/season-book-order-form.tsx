"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  SeasonBookOrderRequest,
  SeasonBookOrderResponse,
} from "@basebook/contracts";

import { ApiClientError } from "@/lib/api/http";
import { createSeasonBookOrder } from "@/lib/api/season-books";

type SeasonBookOrderFormProps = {
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

function buildOrderPayload(
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

export function SeasonBookOrderForm({ projectId }: SeasonBookOrderFormProps) {
  const [values, setValues] = useState<OrderFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<OrderFormErrors>({});
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderResult, setOrderResult] =
    useState<SeasonBookOrderResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const payloadPreview = buildOrderPayload(projectId, values);

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
      const response = await createSeasonBookOrder(payloadPreview);
      setOrderResult(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setOrderError(error.message);
      } else {
        setOrderError(
          "예상하지 못한 오류가 발생했습니다. POST /season-books/order 응답을 다시 확인해 주세요.",
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
            `POST /season-books/order` 요청에 필요한 최소 배송 정보를
            입력합니다. 결제와 배송 추적은 이번 슬라이스 범위가 아닙니다.
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
          <h2 className="mt-2 break-all text-2xl font-semibold tracking-tight text-stone-950">
            {projectId}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            견적 화면에서 전달된 `projectId`로 주문을 생성합니다. 프로젝트 상세
            재조회 API는 아직 연결하지 않았습니다.
          </p>
        </div>

        {orderError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {orderError}
          </p>
        ) : null}

        {orderResult ? (
          <div className="space-y-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
            <p className="font-semibold">주문 요청이 완료되었습니다.</p>
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
          </div>
        ) : null}

        <pre className="max-h-64 overflow-auto rounded-[20px] bg-stone-950 px-4 py-4 text-xs leading-6 text-stone-100">
          {JSON.stringify(payloadPreview, null, 2)}
        </pre>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {isSubmitting ? "주문 요청 중..." : "시즌북 주문 요청"}
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
