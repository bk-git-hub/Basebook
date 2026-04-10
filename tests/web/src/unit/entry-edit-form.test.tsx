import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EntryEditForm } from "@/components/entry-edit-form";
import { createEntry } from "../fixtures/entries";

const push = vi.fn();
const refresh = vi.fn();
const updateEntryMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/api/entries", () => ({
  updateEntry: (...args: unknown[]) => updateEntryMock(...args),
}));

describe("Entry edit QA smoke", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    updateEntryMock.mockReset();
  });

  it("does not send a patch when nothing changed", async () => {
    const user = userEvent.setup();

    render(<EntryEditForm entry={createEntry()} />);

    await user.click(screen.getByRole("button", { name: "수정 내용 저장" }));

    expect(
      screen.getByText("변경된 항목이 없어 저장 요청을 보내지 않았습니다."),
    ).toBeInTheDocument();
    expect(updateEntryMock).not.toHaveBeenCalled();
  });

  it("sends only the changed patch fields and redirects back to detail", async () => {
    const user = userEvent.setup();
    const entry = createEntry();

    updateEntryMock.mockResolvedValue({
      entry: createEntry({
        highlight: "수정된 QA smoke highlight",
      }),
    });

    render(<EntryEditForm entry={entry} />);

    await user.clear(screen.getByLabelText("한 줄 감상"));
    await user.type(
      screen.getByLabelText("한 줄 감상"),
      "수정된 QA smoke highlight",
    );
    await user.click(screen.getByRole("button", { name: "수정 내용 저장" }));

    await waitFor(() => expect(updateEntryMock).toHaveBeenCalledTimes(1));

    expect(updateEntryMock).toHaveBeenCalledWith(entry.id, {
      highlight: "수정된 QA smoke highlight",
    });
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(`/entries/${entry.id}`),
    );
    expect(refresh).toHaveBeenCalled();
  });
});
