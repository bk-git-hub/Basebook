import type {
  SeasonBookEstimateRequest,
  SeasonBookEstimateResponse,
} from "@basebook/contracts";

import { fetchJson } from "./http";

export async function estimateSeasonBook(
  payload: SeasonBookEstimateRequest,
): Promise<SeasonBookEstimateResponse> {
  return fetchJson<SeasonBookEstimateResponse>("/season-books/estimate", {
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  });
}
