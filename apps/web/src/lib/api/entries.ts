import type {
  CreateDiaryEntryInput,
  GetEntryResponse,
  GetEntriesQuery,
  GetEntriesResponse,
  UpdateDiaryEntryInput,
} from "@basebook/contracts";

import { fetchJson } from "./http";

export async function getEntries(
  query: GetEntriesQuery = {},
): Promise<GetEntriesResponse> {
  return fetchJson<GetEntriesResponse>("/entries", { query });
}

export async function getEntry(id: string): Promise<GetEntryResponse> {
  return fetchJson<GetEntryResponse>(`/entries/${id}`);
}

export async function updateEntry(
  id: string,
  payload: UpdateDiaryEntryInput,
): Promise<GetEntryResponse> {
  return fetchJson<GetEntryResponse>(`/entries/${id}`, {
    init: {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  });
}

export async function createEntry(
  payload: CreateDiaryEntryInput,
): Promise<GetEntryResponse> {
  return fetchJson<GetEntryResponse>("/entries", {
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  });
}
