"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type {
  DiaryEntry,
  PhotoAsset,
  SeasonBookEstimateResponse,
} from "@basebook/contracts";

import { estimateSeasonBook } from "@/lib/api/season-books";
import { ApiClientError } from "@/lib/api/http";
import { uploadImage } from "@/lib/api/uploads";

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
  const [coverAsset, setCoverAsset] = useState<PhotoAsset | null>(null);
  const [localCoverPreviewUrl, setLocalCoverPreviewUrl] = useState<
    string | null
  >(null);
  const [coverStatusMessage, setCoverStatusMessage] = useState<string | null>(
    null,
  );
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isManualCoverInputOpen, setIsManualCoverInputOpen] = useState(false);
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
  const coverPreviewUrl = localCoverPreviewUrl ?? coverPhotoUrl.trim();
  const estimateInput = {
    seasonYear: selectedSeasonYear ?? new Date().getFullYear(),
    title: title.trim(),
    introText: introText.trim() || undefined,
    coverPhotoUrl: coverPhotoUrl.trim(),
    selectedEntryIds,
  };

  useEffect(() => {
    return () => {
      if (localCoverPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localCoverPreviewUrl);
      }
    };
  }, [localCoverPreviewUrl]);

  function resetEstimateFeedback() {
    setEstimateError(null);
    setEstimateResult(null);
  }

  function clearCoverPhotoError() {
    setFormErrors((current) => {
      if (!current.coverPhotoUrl) {
        return current;
      }

      const next = { ...current };
      delete next.coverPhotoUrl;
      return next;
    });
  }

  function validateEstimateRequest(): FormErrors {
    const nextErrors: FormErrors = {};

    if (selectedEntryIds.length === 0) {
      nextErrors.selectedEntryIds = "시즌북에 넣을 기록을 하나 이상 선택해 주세요.";
    }

    if (!title.trim()) {
      nextErrors.title = "시즌북 제목을 입력해 주세요.";
    }

    if (isUploadingCover) {
      nextErrors.coverPhotoUrl =
        "커버 이미지를 업로드 중입니다. 업로드가 끝난 뒤 다시 시도해 주세요.";
    } else if (!coverPhotoUrl.trim()) {
      nextErrors.coverPhotoUrl =
        "커버 이미지를 업로드하거나 선택 기록의 첫 사진을 커버로 사용해 주세요.";
    }

    return nextErrors;
  }

  function handleUseSuggestedCover() {
    if (!suggestedCoverPhotoUrl) {
      setFormErrors((current) => ({
        ...current,
        coverPhotoUrl:
          "선택한 기록에 첨부 사진이 없습니다. 이미지를 업로드하거나 직접 URL을 입력해 주세요.",
      }));
      return;
    }

    setCoverAsset(null);
    setLocalCoverPreviewUrl(null);
    setIsManualCoverInputOpen(false);
    setCoverPhotoUrl(suggestedCoverPhotoUrl);
    setCoverStatusMessage(
      "선택한 기록에 포함된 첫 번째 사진을 커버로 적용했습니다.",
    );
    setCoverUploadError(null);
    clearCoverPhotoError();
    resetEstimateFeedback();
  }

  function handleChangeSelectedEntryIds(nextEntryIds: string[]) {
    setSelectedEntryIds(nextEntryIds);
    resetEstimateFeedback();
    setFormErrors((current) => {
      if (!current.selectedEntryIds) {
        return current;
      }

      const next = { ...current };
      delete next.selectedEntryIds;
      return next;
    });
  }

  async function handleUploadCover(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setCoverAsset(null);
    setLocalCoverPreviewUrl(nextPreviewUrl);
    setIsManualCoverInputOpen(false);
    setCoverStatusMessage(
      `${selectedFile.name} 업로드 중입니다. 완료되면 자동으로 커버에 반영됩니다.`,
    );
    setCoverUploadError(null);
    setIsUploadingCover(true);
    resetEstimateFeedback();

    try {
      const response = await uploadImage(selectedFile);
      setCoverAsset(response.asset);
      setLocalCoverPreviewUrl(null);
      setCoverPhotoUrl(response.asset.url);
      setCoverStatusMessage(
        `${response.asset.fileName || selectedFile.name} 업로드가 완료되어 커버 이미지로 적용했습니다.`,
      );
      clearCoverPhotoError();
    } catch (error) {
      setLocalCoverPreviewUrl(null);
      setCoverUploadError(
        error instanceof ApiClientError
          ? error.message
          : "커버 이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setCoverStatusMessage(null);
    } finally {
      setIsUploadingCover(false);
    }
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

      <aside className="h-fit space-y-6 rounded-[30px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)] lg:sticky lg:top-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
            selection summary
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#11284f]">
            {selectedEntryIds.length}개 기록
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
            지금 담은 기록 구성을 한눈에 봅니다.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl bg-[#fbfdff] px-4 py-3 ring-1 ring-[#e5ecf6]">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
              Season
            </p>
            <p className="mt-1 text-sm font-semibold text-[#11284f]">
              {selectedSeasonYear ? `${selectedSeasonYear} 시즌` : "미선택"}
            </p>
          </div>
          <div className="rounded-2xl bg-[#fbfdff] px-4 py-3 ring-1 ring-[#e5ecf6]">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#c42d3c] uppercase">
              Photos
            </p>
            <p className="mt-1 text-sm font-semibold text-[#11284f]">
              첨부 사진 {selectedPhotoCount}장
            </p>
          </div>
        </div>

        {formErrors.selectedEntryIds ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formErrors.selectedEntryIds}
          </p>
        ) : null}

        <div className="space-y-4 rounded-[24px] border border-[#e5ecf6] bg-[#fbfdff] px-4 py-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#11284f]">
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
              className="w-full rounded-2xl border border-[#d7e2f0] bg-white px-4 py-3 text-sm text-[#11284f] outline-none transition focus:border-[#11284f]"
            />
            {formErrors.title ? (
              <p className="text-sm text-rose-600">{formErrors.title}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#11284f]">
              소개문
            </span>
            <textarea
              value={introText}
              onChange={(event) => setIntroText(event.target.value)}
              rows={4}
              placeholder="이번 시즌을 어떤 기억으로 남기고 싶은지 적어 주세요."
              className="w-full rounded-[20px] border border-[#d7e2f0] bg-white px-4 py-3 text-sm leading-6 text-[#11284f] outline-none transition focus:border-[#11284f]"
            />
          </label>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#11284f]">
                커버 이미지
              </p>
              <p className="text-xs leading-5 text-[#5a6f91]">
                커버로 쓸 이미지를 올려 주세요. 선택한 기록의 첫 사진도 사용할
                수 있습니다.
              </p>
            </div>

            <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-[#11284f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]">
              {isUploadingCover ? "커버 업로드 중..." : "커버 이미지 업로드"}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCover}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={handleUseSuggestedCover}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-4 py-2.5 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
            >
              선택 기록의 첫 사진을 커버로 사용
            </button>

            <button
              type="button"
              onClick={() =>
                setIsManualCoverInputOpen((current) => !current)
              }
              className="inline-flex items-center justify-center self-start rounded-full border border-[#d4ddeb] bg-white px-3 py-2 text-xs font-semibold text-[#4f6488] transition hover:border-[#aebfd8] hover:text-[#11284f]"
            >
              {isManualCoverInputOpen ? "직접 URL 입력 닫기" : "직접 URL 입력"}
            </button>

            {coverStatusMessage ? (
              <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                {coverStatusMessage}
              </p>
            ) : null}

            {coverUploadError ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {coverUploadError}
              </p>
            ) : null}

            {coverPreviewUrl ? (
              <div className="overflow-hidden rounded-[24px] border border-[#e5ecf6] bg-white">
                <div className="aspect-[4/5] bg-[#f3f7fc]">
                  <img
                    src={coverPreviewUrl}
                    alt="시즌북 커버 미리보기"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1 px-4 py-3 text-xs text-[#5a6f91]">
                  <p className="font-semibold text-[#11284f]">
                    {coverAsset?.fileName || "현재 커버 이미지 미리보기"}
                  </p>
                  <p className="break-all">
                    {coverAsset?.url || coverPhotoUrl.trim()}
                  </p>
                </div>
              </div>
            ) : null}

            {isManualCoverInputOpen ? (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#11284f]">
                  커버 사진 URL
                </span>
                <input
                  type="url"
                  value={coverPhotoUrl}
                  onChange={(event) => {
                    setCoverAsset(null);
                    setLocalCoverPreviewUrl(null);
                    setCoverStatusMessage(null);
                    setCoverUploadError(null);
                    setCoverPhotoUrl(event.target.value);
                    clearCoverPhotoError();
                    resetEstimateFeedback();
                  }}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-[#d7e2f0] bg-white px-4 py-3 text-sm text-[#11284f] outline-none transition focus:border-[#11284f]"
                />
                <p className="text-xs leading-5 text-[#5a6f91]">
                  직접 URL을 넣는 경우에는 이미지가 바로 열리는 주소를 사용해
                  주세요.
                </p>
              </label>
            ) : null}

            {formErrors.coverPhotoUrl ? (
              <p className="text-sm text-rose-600">
                {formErrors.coverPhotoUrl}
              </p>
            ) : null}
          </div>
        </div>

        {estimateError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {estimateError}
          </p>
        ) : null}

        {estimateResult ? (
          <div className="space-y-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
            <p className="font-semibold">견적이 준비됐습니다.</p>
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
              className="inline-flex w-full items-center justify-center rounded-full bg-[#11284f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
            >
              주문 화면으로 이동
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isEstimating || isUploadingCover}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#11284f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b] disabled:cursor-not-allowed disabled:bg-[#95a8c6]"
        >
          {isUploadingCover
            ? "커버 업로드 완료 대기 중..."
            : isEstimating
              ? "견적 생성 중..."
              : "시즌북 견적 생성"}
        </button>
      </aside>
    </form>
  );
}
