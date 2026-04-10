import type { DiaryEntry, GetEntriesResponse, GetEntryResponse } from "@basebook/contracts";

export function createEntry(overrides: Partial<DiaryEntry> = {}): DiaryEntry {
  return {
    id: "entry-lg-2026-03-22",
    ownerId: "demo-user-001",
    gameId: "game-lg-2026-03-22",
    seasonYear: 2026,
    date: "2026-03-22",
    favoriteTeam: "LG",
    opponentTeam: "DOOSAN",
    scoreFor: 5,
    scoreAgainst: 3,
    result: "WIN",
    watchType: "TV",
    stadium: "Jamsil Baseball Stadium",
    seat: "1루 내야 지정석 113블록 7열",
    playerOfTheDay: "오스틴",
    highlight: "집관이었지만 끝내기 장면 때문에 소리 질렀다.",
    rawMemo: "집에서 가족이랑 봤는데 7회 역전 분위기가 정말 좋았다.",
    photos: [],
    createdAt: "2026-03-22T08:00:00.000Z",
    updatedAt: "2026-04-10T04:17:54.818Z",
    ...overrides,
  };
}

export function createEntriesResponse(): GetEntriesResponse {
  return {
    entries: [
      createEntry({
        id: "entry-lg-2026-04-02",
        date: "2026-04-02",
        opponentTeam: "SSG",
        scoreFor: 4,
        scoreAgainst: 4,
        result: "DRAW",
        watchType: "MOBILE",
        stadium: undefined,
        seat: undefined,
        highlight:
          "퇴근길에 휴대폰으로 보던 경기였는데, 마지막 이닝 동점 상황이 끝까지 손에 땀을 쥐게 했다.",
        rawMemo: "지하철에서 끝까지 보다가 내릴 역을 놓칠 뻔했다.",
      }),
      createEntry(),
      createEntry({
        id: "entry-lg-2025-09-18",
        seasonYear: 2025,
        date: "2025-09-18",
        opponentTeam: "KT",
        scoreFor: 6,
        scoreAgainst: 2,
        result: "WIN",
        watchType: "STADIUM",
        highlight: "9회말 쐐기 적시타가 나오자 잠실이 완전히 뒤집혔다.",
      }),
    ],
    summary: {
      totalGames: 3,
      wins: 2,
      losses: 0,
      draws: 1,
    },
  };
}

export function createEntryResponse(
  overrides: Partial<DiaryEntry> = {},
): GetEntryResponse {
  return {
    entry: createEntry(overrides),
  };
}
