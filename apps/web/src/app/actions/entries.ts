"use server";

import type {
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
} from "@basebook/contracts";
import { updateTag } from "next/cache";

import {
  createEntry,
  deleteEntry,
  updateEntry,
} from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";
import { ENTRIES_LIST_TAG, getEntryTag } from "@/lib/cache/entry-tags";

type EntryActionError = {
  message: string;
  status: number;
  code?: string;
  requestId?: string;
};

export type EntryActionResult =
  | { ok: true; entryId: string }
  | { ok: false; error: EntryActionError };

export type DeleteEntryActionResult =
  | { ok: true; result: "success" | "missing" }
  | { ok: false; error: EntryActionError };

function toActionError(error: unknown): EntryActionError {
  if (error instanceof ApiClientError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      requestId: error.requestId,
    };
  }

  return {
    message: "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    status: 500,
  };
}

export async function createEntryAction(
  payload: CreateDiaryEntryInput,
): Promise<EntryActionResult> {
  try {
    const response = await createEntry(payload);
    updateTag(ENTRIES_LIST_TAG);

    return { ok: true, entryId: response.entry.id };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function updateEntryAction(
  entryId: string,
  payload: UpdateDiaryEntryInput,
): Promise<EntryActionResult> {
  try {
    const response = await updateEntry(entryId, payload);
    updateTag(ENTRIES_LIST_TAG);
    updateTag(getEntryTag(entryId));

    return { ok: true, entryId: response.entry.id };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function deleteEntryAction(
  entryId: string,
): Promise<DeleteEntryActionResult> {
  try {
    await deleteEntry(entryId);
    updateTag(ENTRIES_LIST_TAG);
    updateTag(getEntryTag(entryId));

    return { ok: true, result: "success" };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      updateTag(ENTRIES_LIST_TAG);
      updateTag(getEntryTag(entryId));

      return { ok: true, result: "missing" };
    }

    return { ok: false, error: toActionError(error) };
  }
}
