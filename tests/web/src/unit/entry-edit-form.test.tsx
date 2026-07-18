import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EntryEditForm } from "@/components/entry-edit-form";
import { createEntry } from "../fixtures/entries";

const push = vi.fn();
const updateEntryMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/app/actions/entries", () => ({
  updateEntryAction: (...args: unknown[]) => updateEntryMock(...args),
}));

describe("Entry edit QA smoke", () => {
  beforeEach(() => {
    push.mockReset();
    updateEntryMock.mockReset();
  });

  it("does not send a patch when nothing changed", async () => {
    const user = userEvent.setup();
    const entry = createEntry();

    render(<EntryEditForm entry={entry} />);

    await user.click(screen.getByRole("button", { name: "수정 내용 저장" }));

    expect(updateEntryMock).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(
      screen.getByRole("link", { name: "상세 화면으로 돌아가기" }),
    ).toHaveAttribute("href", `/entries/${entry.id}`);
  });

  it("sends only the changed patch fields and redirects back to detail", async () => {
    const user = userEvent.setup();
    const entry = createEntry();

    updateEntryMock.mockResolvedValue({
      ok: true,
      entryId: entry.id,
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
  });
});
