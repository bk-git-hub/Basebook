export type TeamCode =
  | "LG"
  | "DOOSAN"
  | "SSG"
  | "KIWOOM"
  | "KT"
  | "NC"
  | "KIA"
  | "LOTTE"
  | "SAMSUNG"
  | "HANWHA";

export type WatchType = "STADIUM" | "TV" | "MOBILE" | "OTHER";

export type GameResult = "WIN" | "LOSE" | "DRAW" | "UNKNOWN";

export type GameStatus = "SCHEDULED" | "FINAL";

export type DataSource = "SEED" | "MANUAL" | "SYNC";

export type CurrencyCode = "KRW";

export type IsoDateString = string;

export type IsoDateTimeString = string;

export type EntityId = string;

export type ActorRole = "FAN" | "ADMIN";
