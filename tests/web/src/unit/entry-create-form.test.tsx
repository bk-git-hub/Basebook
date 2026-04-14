import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EntryCreateForm } from "@/components/entry-create-form";
import { createEntry } from "../fixtures/entries";

const push = vi.fn();
const refresh = vi.fn();
const createEntryMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/api/entries", () => ({
  createEntry: (...args: unknown[]) => createEntryMock(...args),
}));

describe("Entry create QA smoke", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    createEntryMock.mockReset();
  });

  it("shows required validation before submit", async () => {
    const user = userEvent.setup();

    render(<EntryCreateForm />);

    await user.click(screen.getByRole("button", { name: "새 기록 저장" }));

    expect(
      screen.getByText("한 줄 감상은 비워둘 수 없습니다."),
    ).toBeInTheDocument();
    expect(createEntryMock).not.toHaveBeenCalled();
  });

  it("submits the API payload and redirects to the created detail page", async () => {
    const user = userEvent.setup();

    createEntryMock.mockResolvedValue({
      entry: createEntry({
        id: "entry-created-by-test",
        highlight: "QA smoke test created entry",
      }),
    });

    render(<EntryCreateForm />);

    await user.selectOptions(screen.getByLabelText("상대 팀"), "SSG");
    await user.type(screen.getByLabelText("연결된 경기"), "game-smoke-test");
    await user.type(screen.getByLabelText("우리 팀 점수"), "8");
    await user.type(screen.getByLabelText("상대 팀 점수"), "6");
    await user.type(screen.getByLabelText("경기장"), "QA Stadium");
    await user.type(screen.getByLabelText("오늘의 선수"), "홍창기");
    await user.type(
      screen.getByLabelText("한 줄 감상"),
      "QA smoke test created entry",
    );
    await user.type(
      screen.getByLabelText("상세 메모"),
      "Created from tests/web unit smoke test.",
    );
    await user.click(screen.getByRole("button", { name: "새 기록 저장" }));

    await waitFor(() => expect(createEntryMock).toHaveBeenCalledTimes(1));

    expect(createEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: "game-smoke-test",
        opponentTeam: "SSG",
        scoreFor: 8,
        scoreAgainst: 6,
        stadium: "QA Stadium",
        playerOfTheDay: "홍창기",
        highlight: "QA smoke test created entry",
      }),
    );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/entries/entry-created-by-test"),
    );
    expect(refresh).toHaveBeenCalled();
  });
});
