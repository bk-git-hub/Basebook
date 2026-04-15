import { expect, type APIRequestContext } from "@playwright/test";

const PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0X3sAAAAASUVORK5CYII=",
  "base64",
);

const API_BASE_URL =
  process.env.PLAYWRIGHT_API_BASE_URL || "http://localhost:4000";

type UploadedAsset = {
  id: string;
  fileName?: string;
  url: string;
};

type CreatedEntry = {
  id: string;
  highlight: string;
  photos: UploadedAsset[];
};

type CreatedEstimate = {
  projectId: string;
  bookUid: string;
  pageCount: number;
  totalPrice: number;
  currency: "KRW";
};

type CreatedOrder = {
  projectId: string;
  orderUid: string;
  orderStatus: string;
  projectStatus: string;
};

type ShippingPayload = {
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address1: string;
  address2?: string;
};

function uniqueSuffix(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildOrderPageUrl(estimate: CreatedEstimate) {
  const params = new URLSearchParams({
    pageCount: String(estimate.pageCount),
    totalPrice: String(estimate.totalPrice),
    currency: estimate.currency,
  });

  return `/order/${encodeURIComponent(estimate.projectId)}?${params.toString()}`;
}

export async function uploadImageAsset(
  request: APIRequestContext,
  label = uniqueSuffix("qa-image"),
) {
  const response = await request.post(`${API_BASE_URL}/uploads/image`, {
    multipart: {
      file: {
        name: `${label}.png`,
        mimeType: "image/png",
        buffer: PNG_BUFFER,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as {
    asset: UploadedAsset;
  };

  expect(payload.asset.url.startsWith(`${API_BASE_URL}/uploads/local/`)).toBeTruthy();

  return payload.asset;
}

export async function createEntryViaApi(
  request: APIRequestContext,
  overrides: Partial<{
    date: string;
    favoriteTeam: string;
    opponentTeam: string;
    highlight: string;
    includePhoto: boolean;
    playerOfTheDay: string;
    rawMemo: string;
    result: "WIN" | "LOSE" | "DRAW" | "UNKNOWN";
    scoreAgainst: number;
    scoreFor: number;
    stadium: string;
    watchType: "STADIUM" | "TV" | "MOBILE" | "OTHER";
  }> = {},
) {
  const highlight = overrides.highlight || uniqueSuffix("로컬 E2E 기록");
  const photos = overrides.includePhoto
    ? [await uploadImageAsset(request, uniqueSuffix("entry-photo"))]
    : [];

  const response = await request.post(`${API_BASE_URL}/entries`, {
    data: {
      seasonYear: 2026,
      date: overrides.date || "2026-04-15",
      favoriteTeam: overrides.favoriteTeam || "LG",
      opponentTeam: overrides.opponentTeam || "DOOSAN",
      scoreFor: overrides.scoreFor ?? 4,
      scoreAgainst: overrides.scoreAgainst ?? 2,
      result: overrides.result || "WIN",
      watchType: overrides.watchType || "STADIUM",
      stadium:
        overrides.watchType && overrides.watchType !== "STADIUM"
          ? undefined
          : overrides.stadium || "잠실야구장",
      seat:
        overrides.watchType && overrides.watchType !== "STADIUM"
          ? undefined
          : "1루 내야",
      playerOfTheDay: overrides.playerOfTheDay || "QA 선수",
      highlight,
      rawMemo: overrides.rawMemo || "로컬 풀스택 QA용 생성 기록입니다.",
      photos,
    },
  });

  expect(response.status()).toBe(201);

  const payload = (await response.json()) as {
    entry: CreatedEntry;
  };

  return payload.entry;
}

export async function estimateSeasonBookViaApi(
  request: APIRequestContext,
  overrides: Partial<{
    coverPhotoUrl: string;
    entryIds: string[];
    introText: string;
    title: string;
  }> = {},
) {
  const entryIds =
    overrides.entryIds ||
    [
      (
        await createEntryViaApi(request, {
          includePhoto: true,
          highlight: uniqueSuffix("시즌북 선택 기록"),
        })
      ).id,
    ];
  const coverPhotoUrl =
    overrides.coverPhotoUrl || (await uploadImageAsset(request)).url;
  const response = await request.post(`${API_BASE_URL}/season-books/estimate`, {
    data: {
      seasonYear: 2026,
      title: overrides.title || uniqueSuffix("QA 시즌북"),
      introText:
        overrides.introText ||
        "로컬 풀스택 QA에서 시즌북 견적 흐름을 검증합니다.",
      coverPhotoUrl,
      selectedEntryIds: entryIds,
    },
  });

  expect(response.status()).toBe(201);

  return (await response.json()) as CreatedEstimate;
}

export async function createOrderViaApi(
  request: APIRequestContext,
  overrides: Partial<{
    address1: string;
    address2: string;
    postalCode: string;
    recipientName: string;
    recipientPhone: string;
  }> = {},
) {
  const estimate = await estimateSeasonBookViaApi(request);
  const shipping: ShippingPayload = {
    recipientName: overrides.recipientName || "QA 주문자",
    recipientPhone: overrides.recipientPhone || "010-1234-5678",
    postalCode: overrides.postalCode || "06236",
    address1: overrides.address1 || "서울특별시 강남구 테헤란로 123",
    address2: overrides.address2 || "4층 QA석",
  };
  const response = await request.post(`${API_BASE_URL}/season-books/order`, {
    data: {
      projectId: estimate.projectId,
      ...shipping,
    },
  });

  expect(response.status()).toBe(201);

  const order = (await response.json()) as CreatedOrder;

  return {
    estimate,
    order,
    shipping,
  };
}
