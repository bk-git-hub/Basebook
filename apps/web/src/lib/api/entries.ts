import type {
  GetEntriesQuery,
  GetEntriesResponse,
  GetEntryResponse,
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
