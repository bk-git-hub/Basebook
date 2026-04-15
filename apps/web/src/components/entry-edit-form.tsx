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

import { updateEntry } from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";
import { KBO_STADIUM_OPTIONS } from "@/lib/stadium-meta";
import { getTeamLabel } from "@/lib/team-meta";
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

const SURFACE_PANEL_CLASS =
  "rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_16px_40px_rgba(17,40,79,0.05)]";

const FIELD_CLASS =
  "w-full rounded-2xl border border-[#d7e3f2] bg-white px-4 py-3 text-sm text-[#11284f] outline-none transition focus:border-[#11284f] focus:ring-4 focus:ring-[#dbe7f7]";

const PRIMARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full bg-[#11284f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b] disabled:cursor-not-allowed disabled:bg-[#91a5c5]";

const SECONDARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]";

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

  if (values.watchType === "STADIUM" && !values.stadium.trim()) {
    errors.stadium = "직관 기록에는 경기장을 선택해 주세요.";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isStadiumVisit = values.watchType === "STADIUM";
  const watchInfoHeading = isStadiumVisit
    ? "결과와 관람 정보"
    : "결과와 시청 정보";

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

  function handleWatchTypeChange(nextWatchType: WatchType) {
    setValues((current) => ({
      ...current,
      watchType: nextWatchType,
      stadium: nextWatchType === "STADIUM" ? current.stadium : "",
      seat: nextWatchType === "STADIUM" ? current.seat : "",
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.watchType;
      delete next.stadium;
      delete next.seat;
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateValues(values);
    setFieldErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const updateInput = buildUpdateInput(entry, values);

    if (Object.keys(updateInput).length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateEntry(entry.id, updateInput);
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
      <section className="rounded-[32px] border border-[#e5ecf6] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(17,40,79,0.06)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-[#dce6f3] bg-[#fbfdff] px-3 py-1 text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
              Entry Edit
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#11284f] sm:text-4xl">
                {getTeamLabel(values.favoriteTeam)} vs{" "}
                {getTeamLabel(values.opponentTeam)}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/entries/${entry.id}`} className={SECONDARY_BUTTON_CLASS}>
              상세 화면으로 돌아가기
            </Link>
          </div>
        </div>
      </section>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <section className="grid gap-4 lg:grid-cols-2">
          <article className={SURFACE_PANEL_CLASS}>
            <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
              경기 기본 정보
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  시즌 연도
                </span>
                <input
                  type="number"
                  value={values.seasonYear}
                  onChange={(event) =>
                    setFieldValue("seasonYear", event.target.value)
                  }
                  className={FIELD_CLASS}
                />
                {fieldErrors.seasonYear ? (
                  <p className="text-sm text-[#c42d3c]">{fieldErrors.seasonYear}</p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  관람 날짜
                </span>
                <input
                  type="date"
                  value={values.date}
                  onChange={(event) => setFieldValue("date", event.target.value)}
                  className={FIELD_CLASS}
                />
                {fieldErrors.date ? (
                  <p className="text-sm text-[#c42d3c]">{fieldErrors.date}</p>
                ) : null}
              </label>

              <TeamPicker
                label="응원 팀"
                value={values.favoriteTeam}
                onChange={(team) => setFieldValue("favoriteTeam", team)}
                disabledTeams={[values.opponentTeam]}
              />

              <TeamPicker
                label="상대 팀"
                value={values.opponentTeam}
                onChange={(team) => setFieldValue("opponentTeam", team)}
                error={fieldErrors.opponentTeam}
                disabledTeams={[values.favoriteTeam]}
              />
            </div>
          </article>

          <article className={SURFACE_PANEL_CLASS}>
            <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
              {watchInfoHeading}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  결과
                </span>
                <select
                  value={values.result}
                  onChange={(event) =>
                    setFieldValue("result", event.target.value as GameResult)
                  }
                  className={FIELD_CLASS}
                >
                  {RESULT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  관람 형태
                </span>
                <select
                  value={values.watchType}
                  onChange={(event) =>
                    handleWatchTypeChange(event.target.value as WatchType)
                  }
                  className={FIELD_CLASS}
                >
                  {WATCH_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  우리 팀 점수
                </span>
                <input
                  type="number"
                  min="0"
                  value={values.scoreFor}
                  onChange={(event) =>
                    setFieldValue("scoreFor", event.target.value)
                  }
                  className={FIELD_CLASS}
                />
                {fieldErrors.scoreFor ? (
                  <p className="text-sm text-[#c42d3c]">{fieldErrors.scoreFor}</p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  상대 팀 점수
                </span>
                <input
                  type="number"
                  min="0"
                  value={values.scoreAgainst}
                  onChange={(event) =>
                    setFieldValue("scoreAgainst", event.target.value)
                  }
                  className={FIELD_CLASS}
                />
                {fieldErrors.scoreAgainst ? (
                  <p className="text-sm text-[#c42d3c]">
                    {fieldErrors.scoreAgainst}
                  </p>
                ) : null}
              </label>

              {isStadiumVisit ? (
                <>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#11284f]">
                      경기장
                    </span>
                    <select
                      value={values.stadium}
                      onChange={(event) =>
                        setFieldValue("stadium", event.target.value)
                      }
                      className={FIELD_CLASS}
                    >
                      <option value="">경기장을 선택하세요</option>
                      {KBO_STADIUM_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.stadium ? (
                      <p className="text-sm text-[#c42d3c]">
                        {fieldErrors.stadium}
                      </p>
                    ) : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#11284f]">
                      좌석
                    </span>
                    <input
                      type="text"
                      value={values.seat}
                      onChange={(event) =>
                        setFieldValue("seat", event.target.value)
                      }
                      className={FIELD_CLASS}
                    />
                  </label>
                </>
              ) : null}
            </div>
          </article>
        </section>

        <section className="grid gap-4">
          <article className={SURFACE_PANEL_CLASS}>
            <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
              감상 수정
            </h2>
            <div className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  오늘의 선수
                </span>
                <input
                  type="text"
                  value={values.playerOfTheDay}
                  onChange={(event) =>
                    setFieldValue("playerOfTheDay", event.target.value)
                  }
                  className={FIELD_CLASS}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  한 줄 감상
                </span>
                <input
                  type="text"
                  value={values.highlight}
                  onChange={(event) =>
                    setFieldValue("highlight", event.target.value)
                  }
                  className={FIELD_CLASS}
                />
                {fieldErrors.highlight ? (
                  <p className="text-sm text-[#c42d3c]">{fieldErrors.highlight}</p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  상세 메모
                </span>
                <textarea
                  value={values.rawMemo}
                  onChange={(event) =>
                    setFieldValue("rawMemo", event.target.value)
                  }
                  rows={8}
                  className={`${FIELD_CLASS} rounded-[24px] leading-7`}
                />
              </label>
            </div>
          </article>
        </section>

        {submitError ? (
          <p className="rounded-2xl border border-[#f3c9cf] bg-[#fff7f8] px-4 py-3 text-sm text-[#c42d3c]">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={PRIMARY_BUTTON_CLASS}
          >
            {isSubmitting ? "저장 중..." : "수정 내용 저장"}
          </button>
          <Link href={`/entries/${entry.id}`} className={SECONDARY_BUTTON_CLASS}>
            취소하고 돌아가기
          </Link>
        </div>
      </form>
    </div>
  );
}
