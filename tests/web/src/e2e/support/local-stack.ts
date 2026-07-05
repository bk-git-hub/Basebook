import { expect, type APIRequestContext } from "@playwright/test";

const PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0X3sAAAAASUVORK5CYII=",
  "base64",
);

const API_BASE_URL =
  process.env.PLAYWRIGHT_API_BASE_URL || "http://127.0.0.1:4100";

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

function uniqueSuffix(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
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
