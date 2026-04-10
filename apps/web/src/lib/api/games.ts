import type { GetGamesQuery, GetGamesResponse } from "@basebook/contracts";

import { fetchJson } from "./http";

export async function getGames(
  query: GetGamesQuery,
): Promise<GetGamesResponse> {
  return fetchJson<GetGamesResponse>("/games", { query });
}
