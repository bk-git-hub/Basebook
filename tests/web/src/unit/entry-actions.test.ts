import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClientError } from "@/lib/api/http";
import { ENTRIES_LIST_TAG, getEntryTag } from "@/lib/cache/entry-tags";
import { createEntry } from "../fixtures/entries";

const mocks = vi.hoisted(() => ({
  createEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
  updateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag,
}));

vi.mock("@/lib/api/entries", () => ({
  createEntry: mocks.createEntry,
  updateEntry: mocks.updateEntry,
  deleteEntry: mocks.deleteEntry,
}));

import {
  createEntryAction,
  deleteEntryAction,
  updateEntryAction,
} from "@/app/actions/entries";

describe("entry mutation actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates the list after creating an entry", async () => {
    const entry = createEntry();
    mocks.createEntry.mockResolvedValue({ entry });

    const result = await createEntryAction({
      seasonYear: entry.seasonYear,
      date: entry.date,
      favoriteTeam: entry.favoriteTeam,
      opponentTeam: entry.opponentTeam,
      result: entry.result,
      watchType: entry.watchType,
      highlight: entry.highlight,
      photos: entry.photos,
    });

    expect(result).toEqual({ ok: true, entryId: entry.id });
    expect(mocks.updateTag).toHaveBeenCalledOnce();
    expect(mocks.updateTag).toHaveBeenCalledWith(ENTRIES_LIST_TAG);
  });

  it("invalidates the list and detail after updating an entry", async () => {
    const entry = createEntry();
    mocks.updateEntry.mockResolvedValue({ entry });

    const result = await updateEntryAction(entry.id, {
      highlight: "수정된 기록",
    });

    expect(result).toEqual({ ok: true, entryId: entry.id });
    expect(mocks.updateTag.mock.calls).toEqual([
      [ENTRIES_LIST_TAG],
      [getEntryTag(entry.id)],
    ]);
  });

  it("treats an already deleted entry as missing and clears stale tags", async () => {
    const entryId = "missing-entry";
    mocks.deleteEntry.mockRejectedValue(
      new ApiClientError("기록을 찾을 수 없습니다.", { status: 404 }),
    );

    const result = await deleteEntryAction(entryId);

    expect(result).toEqual({ ok: true, result: "missing" });
    expect(mocks.updateTag.mock.calls).toEqual([
      [ENTRIES_LIST_TAG],
      [getEntryTag(entryId)],
    ]);
  });

  it("returns a serializable API error without invalidating tags", async () => {
    mocks.createEntry.mockRejectedValue(
      new ApiClientError("기록 저장에 실패했습니다.", {
        status: 503,
        code: "API_UNAVAILABLE",
        requestId: "request-1",
      }),
    );

    const result = await createEntryAction({
      seasonYear: 2026,
      date: "2026-04-15",
      favoriteTeam: "DOOSAN",
      opponentTeam: "LG",
      result: "WIN",
      watchType: "TV",
      highlight: "저장 실패",
      photos: [],
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message: "기록 저장에 실패했습니다.",
        status: 503,
        code: "API_UNAVAILABLE",
        requestId: "request-1",
      },
    });
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
});
