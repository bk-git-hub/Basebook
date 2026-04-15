import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EntryCreateForm } from "@/components/entry-create-form";
import { ApiClientError } from "@/lib/api/http";
import { createEntry } from "../fixtures/entries";

const push = vi.fn();
const refresh = vi.fn();
const createEntryMock = vi.fn();
const uploadImageMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/api/entries", () => ({
  createEntry: (...args: unknown[]) => createEntryMock(...args),
}));

vi.mock("@/lib/api/uploads", () => ({
  uploadImage: (...args: unknown[]) => uploadImageMock(...args),
}));

function getTeamPicker(label: string) {
  const legend = screen.getByText(label, { selector: "legend" });
  const fieldset = legend.closest("fieldset");

  if (!fieldset) {
    throw new Error(`${label} fieldset was not found.`);
  }

  return fieldset;
}

function getTeamSelect(label: string) {
  return within(getTeamPicker(label)).getByRole("combobox");
}

function getPhotoInput() {
  const input = document.querySelector('input[type="file"]');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Photo input was not found.");
  }

  return input;
}

function getScoreInput(label: string) {
  return screen.getByRole("spinbutton", { name: new RegExp(label) });
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

describe("Entry create QA smoke", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    createEntryMock.mockReset();
    uploadImageMock.mockReset();
    uploadImageMock.mockImplementation((file: File) =>
      Promise.resolve({
        asset: {
          id: `asset-${file.name}`,
          url: `http://localhost:4000/uploads/local/${file.name}`,
          fileName: file.name,
        },
      }),
    );
  });

  it("renders the redesigned defaults with fixed stadium options", () => {
    render(<EntryCreateForm />);

    expect(
      screen.getByRole("heading", { name: "오늘의 직관 기록을 남겨보세요" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로 돌아가기" })).toBeVisible();
    expect(screen.getByLabelText("결과")).toHaveValue("UNKNOWN");

    const opponentTeamSelect = getTeamSelect("상대 팀");
    expect(
      within(opponentTeamSelect).getByRole("option", { name: "두산 베어스" }),
    ).toBeDisabled();

    const stadiumSelect = screen.getByLabelText("경기장");
    const stadiumOptions = within(stadiumSelect)
      .getAllByRole("option")
      .map((option) => option.textContent?.trim())
      .filter((value): value is string => Boolean(value));

    expect(stadiumOptions).toEqual([
      "경기장을 선택하세요",
      "잠실야구장",
      "고척스카이돔",
      "인천SSG랜더스필드",
      "수원 케이티 위즈 파크",
      "대전 한화생명 볼파크",
      "대구삼성라이온즈파크",
      "창원NC파크",
      "광주-기아 챔피언스 필드",
      "사직야구장",
    ]);
  });

  it("switches the watch-flow copy and fields when viewing remotely", async () => {
    const user = userEvent.setup();

    render(<EntryCreateForm />);

    expect(screen.getByLabelText("경기장")).toBeInTheDocument();
    expect(screen.getByLabelText("좌석")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("관람 형태"), "TV");

    expect(
      screen.getByRole("heading", { name: "오늘의 경기 기록을 남겨보세요" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("경기장")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("좌석")).not.toBeInTheDocument();
  });

  it("shows inline validation for missing stadium and highlight", async () => {
    const user = userEvent.setup();

    render(<EntryCreateForm />);

    await user.click(screen.getByRole("button", { name: "새 기록 저장" }));

    expect(
      screen.getByText("직관 기록에는 경기장을 선택해 주세요."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("한 줄 감상은 비워둘 수 없습니다."),
    ).toBeInTheDocument();
    expect(createEntryMock).not.toHaveBeenCalled();
  });

  it("blocks partial score input before submit", async () => {
    const user = userEvent.setup();

    render(<EntryCreateForm />);

    await user.selectOptions(screen.getByLabelText("경기장"), "잠실야구장");
    await user.type(screen.getByLabelText("한 줄 감상"), "점수 검증 확인");
    await user.type(getScoreInput("우리 팀 점수"), "7");
    await user.click(screen.getByRole("button", { name: "새 기록 저장" }));

    expect(
      screen.getAllByText("점수는 두 팀 모두 입력하거나 둘 다 비워 주세요."),
    ).toHaveLength(2);
    expect(createEntryMock).not.toHaveBeenCalled();
  });

  it("uploads photos, disables submit during upload, and lets operators exclude a file", async () => {
    const user = userEvent.setup();
    const firstUpload = createDeferred<{
      asset: { id: string; url: string; fileName?: string };
    }>();
    const secondUpload = createDeferred<{
      asset: { id: string; url: string; fileName?: string };
    }>();

    uploadImageMock
      .mockReturnValueOnce(firstUpload.promise)
      .mockReturnValueOnce(secondUpload.promise);

    render(<EntryCreateForm />);

    const submitButton = screen.getByRole("button", {
      name: "새 기록 저장",
    });

    await user.upload(getPhotoInput(), [
      new File(["first"], "first-photo.png", { type: "image/png" }),
      new File(["second"], "second-photo.png", { type: "image/png" }),
    ]);

    expect(screen.getByText(/업로드 중:/)).toHaveTextContent(
      "업로드 중: first-photo.png, second-photo.png",
    );
    expect(submitButton).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "사진 업로드 완료 후 저장 가능" }),
    ).toBeDisabled();

    firstUpload.resolve({
      asset: {
        id: "asset-photo-1",
        url: "http://localhost:4000/uploads/local/first-photo.png",
        fileName: "first-photo.png",
      },
    });
    secondUpload.resolve({
      asset: {
        id: "asset-photo-2",
        url: "http://localhost:4000/uploads/local/second-photo.png",
        fileName: "second-photo.png",
      },
    });

    await waitFor(() =>
      expect(
        screen.getByText(
          "2개의 사진을 업로드했습니다. 저장하면 이번 기록에 함께 담깁니다.",
        ),
      ).toBeInTheDocument(),
    );

    expect(screen.getByText("first-photo.png")).toBeInTheDocument();
    expect(screen.getByText("second-photo.png")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "이 사진 제외" })[0]);

    expect(
      screen.getByText("선택한 사진을 이번 기록에서 제외했습니다."),
    ).toBeInTheDocument();
    expect(screen.queryByText("first-photo.png")).not.toBeInTheDocument();
    expect(screen.getByText("second-photo.png")).toBeInTheDocument();
  });

  it("submits the current create payload and redirects to the detail page", async () => {
    const user = userEvent.setup();

    uploadImageMock.mockResolvedValue({
      asset: {
        id: "asset-photo-1",
        url: "http://localhost:4000/uploads/local/final-photo.png",
        fileName: "final-photo.png",
      },
    });
    createEntryMock.mockResolvedValue({
      entry: createEntry({
        id: "entry-created-by-test",
        favoriteTeam: "DOOSAN",
        opponentTeam: "SSG",
        highlight: "QA smoke test created entry",
      }),
    });

    render(<EntryCreateForm />);

    await user.selectOptions(getTeamSelect("상대 팀"), "SSG");
    await user.selectOptions(screen.getByLabelText("경기장"), "잠실야구장");
    await user.type(getScoreInput("우리 팀 점수"), "8");
    await user.type(getScoreInput("상대 팀 점수"), "6");
    await user.type(screen.getByLabelText("오늘의 선수"), "양의지");
    await user.type(
      screen.getByLabelText("한 줄 감상"),
      "QA smoke test created entry",
    );
    await user.type(
      screen.getByLabelText("상세 메모"),
      "Created from tests/web unit smoke test.",
    );
    await user.upload(getPhotoInput(), [
      new File(["final"], "final-photo.png", { type: "image/png" }),
    ]);
    await waitFor(() =>
      expect(
        screen.getByText(
          "1개의 사진을 업로드했습니다. 저장하면 이번 기록에 함께 담깁니다.",
        ),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "새 기록 저장" }));

    await waitFor(() => expect(createEntryMock).toHaveBeenCalledTimes(1));

    expect(createEntryMock.mock.calls[0][0]).toMatchObject({
      seasonYear: new Date().getFullYear(),
      favoriteTeam: "DOOSAN",
      opponentTeam: "SSG",
      scoreFor: 8,
      scoreAgainst: 6,
      result: "UNKNOWN",
      watchType: "STADIUM",
      stadium: "잠실야구장",
      playerOfTheDay: "양의지",
      highlight: "QA smoke test created entry",
      rawMemo: "Created from tests/web unit smoke test.",
      photos: [
        {
          id: "asset-photo-1",
          url: "http://localhost:4000/uploads/local/final-photo.png",
          fileName: "final-photo.png",
        },
      ],
    });
    expect(createEntryMock.mock.calls[0][0]).not.toHaveProperty("gameId");

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/entries/entry-created-by-test"),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("shows an API error and preserves the entered values", async () => {
    const user = userEvent.setup();

    createEntryMock.mockRejectedValue(
      new ApiClientError("기록 저장에 실패했습니다.", { status: 500 }),
    );

    render(<EntryCreateForm />);

    await user.selectOptions(getTeamSelect("상대 팀"), "SSG");
    await user.selectOptions(screen.getByLabelText("경기장"), "잠실야구장");
    await user.type(screen.getByLabelText("오늘의 선수"), "양의지");
    await user.type(
      screen.getByLabelText("한 줄 감상"),
      "실패 후에도 입력값이 남아야 합니다.",
    );
    await user.click(screen.getByRole("button", { name: "새 기록 저장" }));

    await waitFor(() =>
      expect(
        screen.getByText("기록 저장에 실패했습니다."),
      ).toBeInTheDocument(),
    );

    expect(screen.getByLabelText("오늘의 선수")).toHaveValue("양의지");
    expect(screen.getByLabelText("한 줄 감상")).toHaveValue(
      "실패 후에도 입력값이 남아야 합니다.",
    );
    expect(screen.getByLabelText("경기장")).toHaveValue("잠실야구장");
  });
});
