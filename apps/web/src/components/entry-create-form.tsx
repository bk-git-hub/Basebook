"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import type {
  CreateDiaryEntryInput,
  GameCandidate,
  GameResult,
  GameStatus,
  PhotoAsset,
  TeamCode,
  WatchType,
} from "@basebook/contracts";

import { createEntry } from "@/lib/api/entries";
import { getGames } from "@/lib/api/games";
import { ApiClientError } from "@/lib/api/http";
import { getTeamLabel } from "@/lib/team-meta";
import { uploadImage } from "@/lib/api/uploads";
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
  | "gameId"
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
  gameId: string;
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

const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  SCHEDULED: "예정",
  IN_PROGRESS: "진행 중",
  FINAL: "종료",
};

const INITIAL_VALUES: EntryFormValues = {
  seasonYear: String(new Date().getFullYear()),
  date: new Date().toISOString().slice(0, 10),
  favoriteTeam: "LG",
  opponentTeam: "DOOSAN",
  scoreFor: "",
  scoreAgainst: "",
  result: "WIN",
  watchType: "STADIUM",
  gameId: "",
  stadium: "",
  seat: "",
  playerOfTheDay: "",
  highlight: "",
  rawMemo: "",
};

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

function buildCreateInput(
  values: EntryFormValues,
  photos: PhotoAsset[],
): CreateDiaryEntryInput {
  return {
    gameId: toOptionalString(values.gameId),
    seasonYear: Number(values.seasonYear),
    date: values.date,
    favoriteTeam: values.favoriteTeam,
    opponentTeam: values.opponentTeam,
    scoreFor: toOptionalNumber(values.scoreFor),
    scoreAgainst: toOptionalNumber(values.scoreAgainst),
    result: values.result,
    watchType: values.watchType,
    stadium: toOptionalString(values.stadium),
    seat: toOptionalString(values.seat),
    playerOfTheDay: toOptionalString(values.playerOfTheDay),
    highlight: values.highlight.trim(),
    rawMemo: toOptionalString(values.rawMemo),
    photos,
  };
}

function buildGamesQuery(values: EntryFormValues) {
  return {
    favoriteTeam: values.favoriteTeam,
    date: values.date || undefined,
    seasonYear: values.seasonYear ? Number(values.seasonYear) : undefined,
  };
}

function applyGameCandidateToValues(
  currentValues: EntryFormValues,
  game: GameCandidate,
): EntryFormValues {
  return {
    ...currentValues,
    gameId: game.id,
    seasonYear: String(game.seasonYear),
    date: game.date,
    favoriteTeam: game.favoriteTeam,
    opponentTeam: game.opponentTeam,
    scoreFor:
      typeof game.scoreFor === "number" ? String(game.scoreFor) : "",
    scoreAgainst:
      typeof game.scoreAgainst === "number" ? String(game.scoreAgainst) : "",
    result: game.result,
    stadium: game.stadium ?? "",
  };
}

export function EntryCreateForm() {
  const router = useRouter();
  const [values, setValues] = useState<EntryFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [gameLookupError, setGameLookupError] = useState<string | null>(null);
  const [gameLookupNote, setGameLookupNote] = useState<string | null>(null);
  const [gameCandidates, setGameCandidates] = useState<GameCandidate[]>([]);
  const [hasRequestedGames, setHasRequestedGames] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoAsset[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadingFileNames, setUploadingFileNames] = useState<string[]>([]);
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

  async function handleLoadGames() {
    setGameLookupError(null);
    setGameLookupNote(null);
    setHasRequestedGames(true);
    setIsLoadingGames(true);

    try {
      const response = await getGames(buildGamesQuery(values));
      const sortedGames = response.games.toSorted((left, right) =>
        left.date.localeCompare(right.date),
      );
      setGameCandidates(sortedGames);

      if (sortedGames.length === 0) {
        setGameLookupNote(
          "조회 조건에 맞는 경기 후보가 없습니다. 날짜나 응원 팀을 바꿔 다시 시도해 주세요.",
        );
        return;
      }

      setGameLookupNote(
        "후보를 확인한 뒤 원하는 경기를 선택하면 폼이 자동으로 채워집니다.",
      );
    } catch (error) {
      setGameCandidates([]);

      if (error instanceof ApiClientError) {
        setGameLookupError(error.message);
      } else {
        setGameLookupError(
          "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsLoadingGames(false);
    }
  }

  function handleSelectGameCandidate(game: GameCandidate) {
    setValues((current) => applyGameCandidateToValues(current, game));
    setGameLookupNote(
      "선택한 경기 후보를 폼에 반영했습니다. 필요한 항목은 계속 수정할 수 있습니다.",
    );
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.date;
      delete next.opponentTeam;
      delete next.scoreFor;
      delete next.scoreAgainst;
      return next;
    });
  }

  async function handleUploadImages(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    setUploadError(null);
    setUploadNote(null);
    setIsUploadingImages(true);
    setUploadingFileNames(selectedFiles.map((file) => file.name));

    try {
      const results = await Promise.allSettled(
        selectedFiles.map((file) => uploadImage(file)),
      );
      const nextAssets = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value.asset] : [],
      );
      const failures = results.filter(
        (result) => result.status === "rejected",
      );

      if (nextAssets.length > 0) {
        setUploadedPhotos((current) => {
          const nextById = new Map(current.map((asset) => [asset.id, asset]));

          for (const asset of nextAssets) {
            nextById.set(asset.id, asset);
          }

          return Array.from(nextById.values());
        });
      }

      if (failures.length === 0) {
        setUploadNote(
          `${nextAssets.length}개의 사진을 업로드했습니다. 저장하면 이번 기록에 함께 담깁니다.`,
        );
        return;
      }

      const firstFailure = failures[0].reason;
      const fallbackMessage =
        failures.length === selectedFiles.length
          ? "사진 업로드가 모두 실패했습니다. 파일을 확인한 뒤 다시 시도해 주세요."
          : `${failures.length}개의 사진 업로드가 실패했습니다. 성공한 사진은 그대로 유지됩니다.`;

      if (firstFailure instanceof ApiClientError) {
        setUploadError(firstFailure.message);
      } else {
        setUploadError(fallbackMessage);
      }

      if (nextAssets.length > 0) {
        setUploadNote(
          `${nextAssets.length}개의 사진은 업로드에 성공했습니다. 실패한 파일은 다시 시도해 주세요.`,
        );
      }
    } finally {
      setIsUploadingImages(false);
      setUploadingFileNames([]);
    }
  }

  function handleRemoveUploadedPhoto(photoId: string) {
    setUploadedPhotos((current) =>
      current.filter((photo) => photo.id !== photoId),
    );
    setUploadNote("선택한 사진을 이번 기록에서 제외했습니다.");
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

    setIsSubmitting(true);

    try {
      const entryInput = buildCreateInput(values, uploadedPhotos);
      const response = await createEntry(entryInput);
      setStatusMessage("기록을 저장했습니다. 생성된 상세 화면으로 이동합니다.");
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
              Entry Create
            </span>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#5a6f91]">
                새 직관 기록 작성
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#11284f] sm:text-4xl">
                오늘의 직관 기록을 남겨보세요
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[#4e6284]">
                경기 정보를 불러오고 사진과 감상을 더해, 시즌북에 담을 수 있는
                한 경기의 기억을 완성합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className={SECONDARY_BUTTON_CLASS}
            >
              홈으로 돌아가기
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
                hint="나를 대표하는 팀을 먼저 고르면 이후 경기 후보 조회에도 그대로 반영됩니다."
                disabledTeams={[values.opponentTeam]}
              />

              <TeamPicker
                label="상대 팀"
                value={values.opponentTeam}
                onChange={(team) => setFieldValue("opponentTeam", team)}
                error={fieldErrors.opponentTeam}
                hint="응원 팀과 다른 팀을 골라 주세요. 같은 팀을 고르면 저장 전에 알려드립니다."
                disabledTeams={[values.favoriteTeam]}
              />

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-[#11284f]">
                  연결된 경기
                </span>
                <input
                  type="text"
                  value={values.gameId}
                  onChange={(event) => setFieldValue("gameId", event.target.value)}
                  placeholder="경기 후보를 선택하면 자동으로 연결됩니다"
                  className={FIELD_CLASS}
                />
              </label>
            </div>
          </article>

          <article className={SURFACE_PANEL_CLASS}>
            <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
              결과와 관람 정보
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
                    setFieldValue("watchType", event.target.value as WatchType)
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

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  경기장
                </span>
                <input
                  type="text"
                  value={values.stadium}
                  onChange={(event) =>
                    setFieldValue("stadium", event.target.value)
                  }
                  className={FIELD_CLASS}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#11284f]">
                  좌석
                </span>
                <input
                  type="text"
                  value={values.seat}
                  onChange={(event) => setFieldValue("seat", event.target.value)}
                  className={FIELD_CLASS}
                />
              </label>
            </div>
          </article>
        </section>

        <section className={SURFACE_PANEL_CLASS}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
                경기 후보 조회
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[#5a6f91]">
                날짜와 응원 팀에 맞는 경기 후보를 불러온 뒤, 원하는 경기를 선택해
                기본 정보를 채울 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadGames}
              disabled={isLoadingGames}
              className={PRIMARY_BUTTON_CLASS}
            >
              {isLoadingGames ? "경기 불러오는 중..." : "경기 후보 불러오기"}
            </button>
          </div>

          {gameLookupError ? (
            <p className="mt-6 rounded-2xl border border-[#f3c9cf] bg-[#fff7f8] px-4 py-3 text-sm text-[#c42d3c]">
              {gameLookupError}
            </p>
          ) : null}

          {gameLookupNote ? (
            <p className="mt-6 rounded-2xl border border-[#e6eef8] bg-[#fbfdff] px-4 py-3 text-sm text-[#5a6f91]">
              {gameLookupNote}
            </p>
          ) : null}

          {hasRequestedGames && gameCandidates.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {gameCandidates.map((game) => {
                const isSelected = values.gameId === game.id;

                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleSelectGameCandidate(game)}
                    className={`rounded-[24px] border px-5 py-4 text-left transition ${
                      isSelected
                        ? "border-[#11284f] bg-[#11284f] text-white shadow-[0_18px_40px_rgba(17,40,79,0.18)]"
                        : "border-[#e5ecf6] bg-white text-[#11284f] hover:border-[#cfdcf0] hover:bg-[#f8fbff]"
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isSelected
                                ? "bg-white/15 text-white"
                                : "border border-[#dce6f3] bg-[#fbfdff] text-[#4d6284]"
                            }`}
                          >
                            {GAME_STATUS_LABELS[game.status]}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? "text-[#d7e3f2]" : "text-[#6a7d9f]"
                            }`}
                          >
                            {game.date} · {game.source}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold">
                          {getTeamLabel(game.favoriteTeam)}
                          {" vs "}
                          {getTeamLabel(game.opponentTeam)}
                        </h3>
                        <p
                          className={`text-sm ${
                            isSelected ? "text-[#dbe7f7]" : "text-[#5a6f91]"
                          }`}
                        >
                          구장: {game.stadium || "미정"} / 결과: {game.result}
                        </p>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 text-right ${
                          isSelected
                            ? "bg-white/10 text-white"
                            : "border border-[#e6eef8] bg-[#fbfdff] text-[#11284f]"
                        }`}
                      >
                        <p className="text-xs font-medium uppercase tracking-[0.16em]">
                          경기 연결
                        </p>
                        <p className="mt-1 break-all font-mono text-xs">
                          {game.id}
                        </p>
                        <p className="mt-3 text-sm font-semibold">
                          {typeof game.scoreFor === "number" &&
                          typeof game.scoreAgainst === "number"
                            ? `${game.scoreFor} : ${game.scoreAgainst}`
                            : "점수 미확정"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <article className={SURFACE_PANEL_CLASS}>
            <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
              감상 작성
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
                  placeholder="오늘 경기에서 가장 오래 남을 장면을 적어 주세요"
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

          <article className={`space-y-4 ${SURFACE_PANEL_CLASS}`}>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#11284f]">
                사진 업로드
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                사진을 먼저 올려두면 저장할 때 이번 기록에 함께 담깁니다. 저장 전에는
                언제든 제외할 수 있습니다.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-[#cfdcf0] bg-[#fbfdff] px-5 py-8 text-center transition hover:border-[#aebfd8] hover:bg-[#f8fbff]">
              <span className="text-sm font-semibold text-[#11284f]">
                사진 선택
              </span>
              <span className="mt-2 text-sm leading-6 text-[#5a6f91]">
                여러 장을 한 번에 선택할 수 있습니다.
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUploadImages}
                className="sr-only"
              />
            </label>

            {isUploadingImages ? (
              <p className="rounded-2xl border border-[#e6eef8] bg-[#fbfdff] px-4 py-3 text-sm text-[#5a6f91]">
                업로드 중: {uploadingFileNames.join(", ")}
              </p>
            ) : null}

            {uploadError ? (
              <p className="rounded-2xl border border-[#f3c9cf] bg-[#fff7f8] px-4 py-3 text-sm text-[#c42d3c]">
                {uploadError}
              </p>
            ) : null}

            {uploadNote ? (
              <p className="rounded-2xl border border-[#e6eef8] bg-[#fbfdff] px-4 py-3 text-sm text-[#5a6f91]">
                {uploadNote}
              </p>
            ) : null}

            {uploadedPhotos.length > 0 ? (
              <ul className="space-y-3">
                {uploadedPhotos.map((photo) => (
                  <li
                    key={photo.id}
                    className="rounded-[24px] border border-[#e6eef8] bg-[#fbfdff] px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#11284f]">
                          {photo.fileName || "업로드된 사진"}
                        </p>
                        <a
                          href={photo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-[#5a6f91] underline underline-offset-4 hover:text-[#11284f]"
                        >
                          업로드 결과 열기
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedPhoto(photo.id)}
                        className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-4 py-2 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
                      >
                        이 사진 제외
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#d7e3f2] bg-[#fbfdff] px-4 py-5 text-sm leading-7 text-[#5a6f91]">
                아직 업로드된 사진이 없습니다. 경기장의 분위기나 기억에 남는 장면을
                함께 남겨보세요.
              </div>
            )}
          </article>
        </section>

        {submitError ? (
          <p className="rounded-2xl border border-[#f3c9cf] bg-[#fff7f8] px-4 py-3 text-sm text-[#c42d3c]">
            {submitError}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="rounded-2xl border border-[#dce6f3] bg-[#fbfdff] px-4 py-3 text-sm text-[#11284f]">
            {statusMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImages}
            className={PRIMARY_BUTTON_CLASS}
          >
            {isUploadingImages
              ? "사진 업로드 완료 후 저장 가능"
              : isSubmitting
                ? "저장 중..."
                : "새 기록 저장"}
          </button>
          <Link
            href="/season"
            className={SECONDARY_BUTTON_CLASS}
          >
            취소하고 돌아가기
          </Link>
        </div>
      </form>
    </div>
  );
}
