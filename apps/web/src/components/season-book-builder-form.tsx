"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  DiaryEntry,
  SeasonBookEstimateResponse,
} from "@basebook/contracts";

import { estimateSeasonBook } from "@/lib/api/season-books";
import { ApiClientError } from "@/lib/api/http";

import { SeasonBookEntrySelection } from "./season-book-entry-selection";

type SeasonBookBuilderFormProps = {
  entries: DiaryEntry[];
};

type FormErrors = Partial<
  Record<"title" | "coverPhotoUrl" | "selectedEntryIds", string>
>;

function getInitialTitle(entries: DiaryEntry[]): string {
  const seasonYear = entries[0]?.seasonYear;

  return seasonYear ? `${seasonYear} 시즌 직관북` : "나의 시즌 직관북";
}

function getFirstSelectedCoverPhotoUrl(
  selectedEntries: DiaryEntry[],
): string | undefined {
  for (const entry of selectedEntries) {
    const photoUrl = entry.photos[0]?.url;

    if (photoUrl) {
      return photoUrl;
    }
  }

  return undefined;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function buildOrderHref(estimate: SeasonBookEstimateResponse): string {
  const searchParams = new URLSearchParams({
    pageCount: String(estimate.pageCount),
    totalPrice: String(estimate.totalPrice),
    currency: estimate.currency,
  });

  if (typeof estimate.creditSufficient === "boolean") {
    searchParams.set("creditSufficient", String(estimate.creditSufficient));
  }

  return `/order/${encodeURIComponent(estimate.projectId)}?${searchParams.toString()}`;
}

export function SeasonBookBuilderForm({ entries }: SeasonBookBuilderFormProps) {
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [title, setTitle] = useState(getInitialTitle(entries));
  const [introText, setIntroText] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [estimateResult, setEstimateResult] =
    useState<SeasonBookEstimateResponse | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const selectedEntryIdSet = new Set(selectedEntryIds);
  const selectedEntries = entries.filter((entry) =>
    selectedEntryIdSet.has(entry.id),
  );
  const selectedPhotoCount = selectedEntries.reduce(
    (total, entry) => total + entry.photos.length,
    0,
  );
  const selectedSeasonYear = selectedEntries[0]?.seasonYear;
  const suggestedCoverPhotoUrl =
    getFirstSelectedCoverPhotoUrl(selectedEntries);
  const estimateInput = {
    seasonYear: selectedSeasonYear ?? new Date().getFullYear(),
    title: title.trim(),
    introText: introText.trim() || undefined,
    coverPhotoUrl: coverPhotoUrl.trim(),
    selectedEntryIds,
  };

  function validateEstimateRequest(): FormErrors {
    const nextErrors: FormErrors = {};

    if (selectedEntryIds.length === 0) {
      nextErrors.selectedEntryIds = "시즌북에 넣을 기록을 하나 이상 선택해 주세요.";
    }

    if (!title.trim()) {
      nextErrors.title = "시즌북 제목을 입력해 주세요.";
    }

    if (!coverPhotoUrl.trim()) {
      nextErrors.coverPhotoUrl =
        "커버 사진 URL을 입력하거나 선택 기록의 첫 사진을 사용해 주세요.";
    }

    return nextErrors;
  }

  function handleUseSuggestedCover() {
    if (!suggestedCoverPhotoUrl) {
      setFormErrors((current) => ({
        ...current,
        coverPhotoUrl:
          "선택한 기록에 첨부 사진이 없습니다. 커버 사진 URL을 직접 입력해 주세요.",
      }));
      return;
    }

    setCoverPhotoUrl(suggestedCoverPhotoUrl);
    setFormErrors((current) => {
      const next = { ...current };
      delete next.coverPhotoUrl;
      return next;
    });
  }

  function handleChangeSelectedEntryIds(nextEntryIds: string[]) {
    setSelectedEntryIds(nextEntryIds);
    setEstimateResult(null);
    setEstimateError(null);
    setFormErrors((current) => {
      if (!current.selectedEntryIds) {
        return current;
      }

      const next = { ...current };
      delete next.selectedEntryIds;
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateEstimateRequest();
    setFormErrors(nextErrors);
    setEstimateError(null);
    setEstimateResult(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsEstimating(true);

    try {
      const result = await estimateSeasonBook(estimateInput);
      setEstimateResult(result);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setEstimateError(error.message);
      } else {
        setEstimateError(
          "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsEstimating(false);
    }
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"
      onSubmit={handleSubmit}
    >
      <SeasonBookEntrySelection
        entries={entries}
        selectedEntryIds={selectedEntryIds}
        onChangeSelectedEntryIds={handleChangeSelectedEntryIds}
      />

      <aside className="h-fit space-y-6 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <div>
          <p className="text-sm font-medium text-stone-500">선택 요약</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
            {selectedEntryIds.length}개 기록
          </h2>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
            <p className="text-xs font-semibold tracking-[0.16em] text-stone-400 uppercase">
              Season
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {selectedSeasonYear ? `${selectedSeasonYear} 시즌` : "미선택"}
            </p>
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
            <p className="text-xs font-semibold tracking-[0.16em] text-stone-400 uppercase">
              Photos
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              첨부 사진 {selectedPhotoCount}장
            </p>
          </div>
        </div>

        {formErrors.selectedEntryIds ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formErrors.selectedEntryIds}
          </p>
        ) : null}

        <div className="space-y-4 rounded-[24px] border border-stone-200 bg-stone-50/70 px-4 py-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-800">
              시즌북 제목
            </span>
            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setFormErrors((current) => {
                  const next = { ...current };
                  delete next.title;
                  return next;
                });
              }}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
            />
            {formErrors.title ? (
              <p className="text-sm text-rose-600">{formErrors.title}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-800">
              소개문
            </span>
            <textarea
              value={introText}
              onChange={(event) => setIntroText(event.target.value)}
              rows={4}
              placeholder="이번 시즌을 어떤 기억으로 남기고 싶은지 적어 주세요."
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-950 outline-none transition focus:border-stone-400"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-800">
              커버 사진 URL
            </span>
            <input
              type="url"
              value={coverPhotoUrl}
              onChange={(event) => {
                setCoverPhotoUrl(event.target.value);
                setFormErrors((current) => {
                  const next = { ...current };
                  delete next.coverPhotoUrl;
                  return next;
                });
              }}
              placeholder="https://..."
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
            />
            {formErrors.coverPhotoUrl ? (
              <p className="text-sm text-rose-600">
                {formErrors.coverPhotoUrl}
              </p>
            ) : null}
            <p className="text-xs leading-5 text-stone-500">
              실제 책 제작에 사용할 수 있도록 외부에서 열리는 이미지 주소를
              입력해 주세요.
            </p>
          </label>

          <button
            type="button"
            onClick={handleUseSuggestedCover}
            className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
          >
            선택 기록의 첫 사진을 커버로 사용
          </button>
        </div>

        {estimateError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {estimateError}
          </p>
        ) : null}

        {estimateResult ? (
          <div className="space-y-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
            <p className="font-semibold">견적 생성이 완료되었습니다.</p>
            <dl className="grid gap-2">
              <div className="flex justify-between gap-4">
                <dt>페이지 수</dt>
                <dd className="font-semibold">{estimateResult.pageCount}p</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>예상 금액</dt>
                <dd className="font-semibold">
                  {formatPrice(estimateResult.totalPrice)}{" "}
                  {estimateResult.currency}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>크레딧</dt>
                <dd className="font-semibold">
                  {estimateResult.creditSufficient === false
                    ? "부족"
                    : "사용 가능"}
                </dd>
              </div>
            </dl>
            <Link
              href={buildOrderHref(estimateResult)}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              주문 화면으로 이동
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isEstimating}
          className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {isEstimating ? "견적 생성 중..." : "시즌북 견적 생성"}
        </button>
      </aside>
    </form>
  );
}
