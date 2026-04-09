import type {
  EntityId,
  GameResult,
  IsoDateString,
  IsoDateTimeString,
  TeamCode,
  WatchType,
} from "./common";

export type PhotoAsset = {
  id: EntityId;
  url: string;
  fileName?: string;
};

export type DiaryEntry = {
  id: EntityId;
  ownerId: EntityId;
  gameId?: EntityId;
  seasonYear: number;
  date: IsoDateString;
  favoriteTeam: TeamCode;
  opponentTeam: TeamCode;
  scoreFor?: number;
  scoreAgainst?: number;
  result: GameResult;
  watchType: WatchType;
  stadium?: string;
  seat?: string;
  playerOfTheDay?: string;
  highlight: string;
  rawMemo?: string;
  photos: PhotoAsset[];
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
};

export type CreateDiaryEntryInput = {
  gameId?: EntityId;
  seasonYear: number;
  date: IsoDateString;
  favoriteTeam: TeamCode;
  opponentTeam: TeamCode;
  scoreFor?: number;
  scoreAgainst?: number;
  result: GameResult;
  watchType: WatchType;
  stadium?: string;
  seat?: string;
  playerOfTheDay?: string;
  highlight: string;
  rawMemo?: string;
  photos: PhotoAsset[];
};

export type UpdateDiaryEntryInput = Partial<CreateDiaryEntryInput>;

export type GetEntriesQuery = {
  favoriteTeam?: TeamCode;
  seasonYear?: number;
};

export type DiaryEntrySummary = {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
};

export type GetEntriesResponse = {
  entries: DiaryEntry[];
  summary: DiaryEntrySummary;
};

export type GetEntryResponse = {
  entry: DiaryEntry;
};
