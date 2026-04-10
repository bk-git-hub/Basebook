import type { GetEntriesQuery, GetEntriesResponse } from "@basebook/contracts";

import { fetchJson } from "./http";

export async function getEntries(
  query: GetEntriesQuery = {},
): Promise<GetEntriesResponse> {
  return fetchJson<GetEntriesResponse>("/entries", { query });
}
