import type {
  DataSource,
  EntityId,
  GameResult,
  GameStatus,
  IsoDateString,
  TeamCode,
} from "./common";

export type GetGamesQuery = {
  favoriteTeam: TeamCode;
  date?: IsoDateString;
  seasonYear?: number;
};

export type GameCandidate = {
  id: EntityId;
  seasonYear: number;
  date: IsoDateString;
  favoriteTeam: TeamCode;
  opponentTeam: TeamCode;
  stadium?: string;
  scoreFor?: number;
  scoreAgainst?: number;
  result: GameResult;
  status: GameStatus;
  source: DataSource;
};

export type GetGamesResponse = {
  games: GameCandidate[];
};

