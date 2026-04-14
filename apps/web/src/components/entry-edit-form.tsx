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
import { TeamPicker } from "@/components/team-picker";

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

function buildUpdateInput(
  initialEntry: DiaryEntry,
  values: EntryFormValues,
): UpdateDiaryEntryInput {
  const updateInput: UpdateDiaryEntryInput = {};
  const seasonYear = Number(values.seasonYear);
  const scoreFor = toOptionalNumber(values.scoreFor);
  const scoreAgainst = toOptionalNumber(values.scoreAgainst);
  const stadium = toOptionalString(values.stadium);
  const seat = toOptionalString(values.seat);
  const playerOfTheDay = toOptionalString(values.playerOfTheDay);
  const highlight = values.highlight.trim();
  const rawMemo = toOptionalString(values.rawMemo);

  if (seasonYear !== initialEntry.seasonYear) {
    updateInput.seasonYear = seasonYear;
  }

  if (values.date !== initialEntry.date) {
    updateInput.date = values.date;
  }

  if (values.favoriteTeam !== initialEntry.favoriteTeam) {
    updateInput.favoriteTeam = values.favoriteTeam;
  }

  if (values.opponentTeam !== initialEntry.opponentTeam) {
    updateInput.opponentTeam = values.opponentTeam;
  }

  if (scoreFor !== initialEntry.scoreFor) {
    updateInput.scoreFor = scoreFor;
  }

  if (scoreAgainst !== initialEntry.scoreAgainst) {
    updateInput.scoreAgainst = scoreAgainst;
  }

  if (values.result !== initialEntry.result) {
    updateInput.result = values.result;
  }

  if (values.watchType !== initialEntry.watchType) {
    updateInput.watchType = values.watchType;
  }

  if (stadium !== initialEntry.stadium) {
    updateInput.stadium = stadium;
  }

  if (seat !== initialEntry.seat) {
    updateInput.seat = seat;
  }

  if (playerOfTheDay !== initialEntry.playerOfTheDay) {
    updateInput.playerOfTheDay = playerOfTheDay;
  }

  if (highlight !== initialEntry.highlight) {
    updateInput.highlight = highlight;
  }

  if (rawMemo !== initialEntry.rawMemo) {
    updateInput.rawMemo = rawMemo;
  }

  return updateInput;
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

    const updateInput = buildUpdateInput(entry, values);

    if (Object.keys(updateInput).length === 0) {
      setStatusMessage("변경된 항목이 없어 저장하지 않았습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateEntry(entry.id, updateInput);
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
          "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
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
                경기 정보와 감상을 다시 다듬고, 저장 후 상세 화면에서 확인할 수
                있습니다.
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

              <TeamPicker
                label="응원 팀"
                value={values.favoriteTeam}
                onChange={(team) => setFieldValue("favoriteTeam", team)}
                hint="수정하면서 응원 팀을 바꾸더라도 나머지 감상 정보는 그대로 유지됩니다."
              />

              <TeamPicker
                label="상대 팀"
                value={values.opponentTeam}
                onChange={(team) => setFieldValue("opponentTeam", team)}
                error={fieldErrors.opponentTeam}
                hint="응원 팀과 상대 팀은 같을 수 없습니다."
              />
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

        <section className="grid gap-4">
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
