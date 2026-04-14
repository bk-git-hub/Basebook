import type {
  CancelSeasonBookOrderResponse,
  GetSeasonBookStatusResponse,
  SeasonBookEstimateRequest,
  SeasonBookEstimateResponse,
  SeasonBookOrderRequest,
  SeasonBookOrderResponse,
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

export async function createSeasonBookOrder(
  payload: SeasonBookOrderRequest,
): Promise<SeasonBookOrderResponse> {
  return fetchJson<SeasonBookOrderResponse>("/season-books/order", {
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  });
}

export async function cancelSeasonBookOrder(
  projectId: string,
): Promise<CancelSeasonBookOrderResponse> {
  return fetchJson<CancelSeasonBookOrderResponse>(
    `/season-books/${encodeURIComponent(projectId)}/cancel`,
    {
      init: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelReason: "USER_REQUESTED",
        }),
      },
    },
  );
}

export async function getSeasonBookStatus(
  projectId: string,
): Promise<GetSeasonBookStatusResponse> {
  return fetchJson<GetSeasonBookStatusResponse>(
    `/season-books/${encodeURIComponent(projectId)}/status`,
  );
}
