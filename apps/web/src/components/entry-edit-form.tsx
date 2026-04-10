"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import type {
  DiaryEntry,
  GameResult,
  TeamCode,
  UpdateDiaryEntryInput,
  WatchType,
} from "@basebook/contracts";

import { ApiClientError } from "@/lib/api/http";
import { updateEntry } from "@/lib/api/entries";

type FieldErrors = Partial<Record<EntryFormField, string>>;

type EntryFormField =
  | "seasonYear"
  | "date"
  | "favoriteTeam"
  | "opponentTeam"
  | "scoreFor"
  | "scoreAgainst"
  | "result"
  | "watchType"
  | "stadium"
  | "seat"
  | "playerOfTheDay"
  | "highlight"
  | "rawMemo";

type EntryFormValues = {
  seasonYear: string;
  date: string;
  favoriteTeam: TeamCode;
  opponentTeam: TeamCode;
  scoreFor: string;
  scoreAgainst: string;
  result: GameResult;
  watchType: WatchType;
  stadium: string;
  seat: string;
  playerOfTheDay: string;
  highlight: string;
  rawMemo: string;
};

const TEAM_OPTIONS: { value: TeamCode; label: string }[] = [
  { value: "LG", label: "LG 트윈스" },
  { value: "DOOSAN", label: "두산 베어스" },
  { value: "SSG", label: "SSG 랜더스" },
  { value: "KIWOOM", label: "키움 히어로즈" },
  { value: "KT", label: "KT 위즈" },
  { value: "NC", label: "NC 다이노스" },
  { value: "KIA", label: "KIA 타이거즈" },
  { value: "LOTTE", label: "롯데 자이언츠" },
  { value: "SAMSUNG", label: "삼성 라이온즈" },
  { value: "HANWHA", label: "한화 이글스" },
];

const RESULT_OPTIONS: { value: GameResult; label: string }[] = [
  { value: "WIN", label: "승리" },
  { value: "LOSE", label: "패배" },
  { value: "DRAW", label: "무승부" },
  { value: "UNKNOWN", label: "미정" },
];

const WATCH_TYPE_OPTIONS: { value: WatchType; label: string }[] = [
  { value: "STADIUM", label: "직관" },
  { value: "TV", label: "TV 시청" },
  { value: "MOBILE", label: "모바일 시청" },
  { value: "OTHER", label: "기타" },
];

function toOptionalString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function toOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return Number(trimmed);
}

function buildInitialValues(entry: DiaryEntry): EntryFormValues {
  return {
    seasonYear: String(entry.seasonYear),
    date: entry.date,
    favoriteTeam: entry.favoriteTeam,
    opponentTeam: entry.opponentTeam,
    scoreFor:
      typeof entry.scoreFor === "number" ? String(entry.scoreFor) : "",
    scoreAgainst:
      typeof entry.scoreAgainst === "number" ? String(entry.scoreAgainst) : "",
    result: entry.result,
    watchType: entry.watchType,
    stadium: entry.stadium ?? "",
    seat: entry.seat ?? "",
    playerOfTheDay: entry.playerOfTheDay ?? "",
    highlight: entry.highlight,
    rawMemo: entry.rawMemo ?? "",
  };
}

function validateValues(values: EntryFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const seasonYear = Number(values.seasonYear);
  const hasScoreFor = values.scoreFor.trim().length > 0;
  const hasScoreAgainst = values.scoreAgainst.trim().length > 0;

  if (!Number.isInteger(seasonYear) || seasonYear < 1900) {
    errors.seasonYear = "시즌 연도를 올바른 숫자로 입력해 주세요.";
  }

  if (!values.date) {
    errors.date = "관람 날짜를 입력해 주세요.";
  }

  if (values.favoriteTeam === values.opponentTeam) {
    errors.opponentTeam = "응원 팀과 상대 팀은 같을 수 없습니다.";
  }

  if (hasScoreFor !== hasScoreAgainst) {
    errors.scoreFor = "점수는 두 팀 모두 입력하거나 둘 다 비워 주세요.";
    errors.scoreAgainst = "점수는 두 팀 모두 입력하거나 둘 다 비워 주세요.";
  }

  if (hasScoreFor && Number(values.scoreFor) < 0) {
    errors.scoreFor = "득점은 0 이상의 숫자여야 합니다.";
  }

  if (hasScoreAgainst && Number(values.scoreAgainst) < 0) {
    errors.scoreAgainst = "실점은 0 이상의 숫자여야 합니다.";
  }

  if (!values.highlight.trim()) {
    errors.highlight = "한 줄 감상은 비워둘 수 없습니다.";
  }

  return errors;
}

function buildUpdatePayload(
  initialEntry: DiaryEntry,
  values: EntryFormValues,
): UpdateDiaryEntryInput {
  const payload: UpdateDiaryEntryInput = {};
  const seasonYear = Number(values.seasonYear);
  const scoreFor = toOptionalNumber(values.scoreFor);
  const scoreAgainst = toOptionalNumber(values.scoreAgainst);
  const stadium = toOptionalString(values.stadium);
  const seat = toOptionalString(values.seat);
  const playerOfTheDay = toOptionalString(values.playerOfTheDay);
  const highlight = values.highlight.trim();
  const rawMemo = toOptionalString(values.rawMemo);

  if (seasonYear !== initialEntry.seasonYear) {
    payload.seasonYear = seasonYear;
  }

  if (values.date !== initialEntry.date) {
    payload.date = values.date;
  }

  if (values.favoriteTeam !== initialEntry.favoriteTeam) {
    payload.favoriteTeam = values.favoriteTeam;
  }

  if (values.opponentTeam !== initialEntry.opponentTeam) {
    payload.opponentTeam = values.opponentTeam;
  }

  if (scoreFor !== initialEntry.scoreFor) {
    payload.scoreFor = scoreFor;
  }

  if (scoreAgainst !== initialEntry.scoreAgainst) {
    payload.scoreAgainst = scoreAgainst;
  }

  if (values.result !== initialEntry.result) {
    payload.result = values.result;
  }

  if (values.watchType !== initialEntry.watchType) {
    payload.watchType = values.watchType;
  }

  if (stadium !== initialEntry.stadium) {
    payload.stadium = stadium;
  }

  if (seat !== initialEntry.seat) {
    payload.seat = seat;
  }

  if (playerOfTheDay !== initialEntry.playerOfTheDay) {
    payload.playerOfTheDay = playerOfTheDay;
  }

  if (highlight !== initialEntry.highlight) {
    payload.highlight = highlight;
  }

  if (rawMemo !== initialEntry.rawMemo) {
    payload.rawMemo = rawMemo;
  }

  return payload;
}

type EntryEditFormProps = {
  entry: DiaryEntry;
};

export function EntryEditForm({ entry }: EntryEditFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<EntryFormValues>(() =>
    buildInitialValues(entry),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payloadPreview = buildUpdatePayload(entry, values);

  function setFieldValue<K extends keyof EntryFormValues>(
    field: K,
    nextValue: EntryFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
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
    setSubmitError(null);
    setStatusMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = buildUpdatePayload(entry, values);

    if (Object.keys(payload).length === 0) {
      setStatusMessage("변경된 항목이 없어 저장 요청을 보내지 않았습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateEntry(entry.id, payload);
      setStatusMessage("수정 내용을 저장했습니다. 상세 화면으로 이동합니다.");
      startTransition(() => {
        router.push(`/entries/${response.entry.id}`);
        router.refresh();
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.message);
      } else {
        setSubmitError(
          "예상하지 못한 오류가 발생했습니다. PATCH /entries/:id 응답을 다시 확인해 주세요.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-stone-200 uppercase">
              Entry Edit
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-300">
                {entry.seasonYear} 시즌 기록 수정
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {entry.highlight}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-stone-300">
                GET /entries/:id로 초기값을 채우고, 바뀐 필드만 PATCH /entries/:id로
                보내는 수정 흐름입니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/entries/${entry.id}`}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
            >
              상세 화면으로 돌아가기
            </Link>
          </div>
        </div>
      </section>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              경기 기본 정보
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  시즌 연도
                </span>
                <input
                  type="number"
                  value={values.seasonYear}
                  onChange={(event) =>
                    setFieldValue("seasonYear", event.target.value)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                />
                {fieldErrors.seasonYear ? (
                  <p className="text-sm text-rose-600">{fieldErrors.seasonYear}</p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  관람 날짜
                </span>
                <input
                  type="date"
                  value={values.date}
                  onChange={(event) => setFieldValue("date", event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                />
                {fieldErrors.date ? (
                  <p className="text-sm text-rose-600">{fieldErrors.date}</p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  응원 팀
                </span>
                <select
                  value={values.favoriteTeam}
                  onChange={(event) =>
                    setFieldValue("favoriteTeam", event.target.value as TeamCode)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                >
                  {TEAM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  상대 팀
                </span>
                <select
                  value={values.opponentTeam}
                  onChange={(event) =>
                    setFieldValue("opponentTeam", event.target.value as TeamCode)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                >
                  {TEAM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.opponentTeam ? (
                  <p className="text-sm text-rose-600">
                    {fieldErrors.opponentTeam}
                  </p>
                ) : null}
              </label>
            </div>
          </article>

          <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              결과와 관람 정보
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  결과
                </span>
                <select
                  value={values.result}
                  onChange={(event) =>
                    setFieldValue("result", event.target.value as GameResult)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                >
                  {RESULT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  관람 형태
                </span>
                <select
                  value={values.watchType}
                  onChange={(event) =>
                    setFieldValue("watchType", event.target.value as WatchType)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                >
                  {WATCH_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  우리 팀 점수
                </span>
                <input
                  type="number"
                  min="0"
                  value={values.scoreFor}
                  onChange={(event) =>
                    setFieldValue("scoreFor", event.target.value)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                />
                {fieldErrors.scoreFor ? (
                  <p className="text-sm text-rose-600">{fieldErrors.scoreFor}</p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  상대 팀 점수
                </span>
                <input
                  type="number"
                  min="0"
                  value={values.scoreAgainst}
                  onChange={(event) =>
                    setFieldValue("scoreAgainst", event.target.value)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                />
                {fieldErrors.scoreAgainst ? (
                  <p className="text-sm text-rose-600">
                    {fieldErrors.scoreAgainst}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  경기장
                </span>
                <input
                  type="text"
                  value={values.stadium}
                  onChange={(event) =>
                    setFieldValue("stadium", event.target.value)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  좌석
                </span>
                <input
                  type="text"
                  value={values.seat}
                  onChange={(event) => setFieldValue("seat", event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                />
              </label>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              감상 수정
            </h2>
            <div className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  오늘의 선수
                </span>
                <input
                  type="text"
                  value={values.playerOfTheDay}
                  onChange={(event) =>
                    setFieldValue("playerOfTheDay", event.target.value)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  한 줄 감상
                </span>
                <input
                  type="text"
                  value={values.highlight}
                  onChange={(event) =>
                    setFieldValue("highlight", event.target.value)
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                />
                {fieldErrors.highlight ? (
                  <p className="text-sm text-rose-600">{fieldErrors.highlight}</p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  상세 메모
                </span>
                <textarea
                  value={values.rawMemo}
                  onChange={(event) =>
                    setFieldValue("rawMemo", event.target.value)
                  }
                  rows={8}
                  className="w-full rounded-[24px] border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-950 outline-none transition focus:border-stone-400"
                />
              </label>
            </div>
          </article>

          <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              PATCH 미리보기
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              이번 저장에서 실제로 변경된 필드만 요청 body에 담깁니다.
            </p>
            <pre className="mt-6 overflow-x-auto rounded-[24px] bg-stone-950 px-4 py-4 text-xs leading-6 text-stone-100">
              {JSON.stringify(payloadPreview, null, 2)}
            </pre>
            <div className="mt-6 rounded-[24px] border border-dashed border-stone-200 bg-stone-50/70 px-4 py-4 text-sm leading-7 text-stone-500">
              사진은 아직 업로드 편집 API가 붙지 않았기 때문에 이번 PATCH 범위에서 제외했습니다.
            </div>
          </article>
        </section>

        {submitError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {statusMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isSubmitting ? "저장 중..." : "수정 내용 저장"}
          </button>
          <Link
            href={`/entries/${entry.id}`}
            className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            취소하고 돌아가기
          </Link>
        </div>
      </form>
    </div>
  );
}
