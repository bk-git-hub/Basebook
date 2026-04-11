PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "DiaryEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "gameId" TEXT,
  "seasonYear" INTEGER NOT NULL,
  "date" TEXT NOT NULL,
  "favoriteTeam" TEXT NOT NULL,
  "opponentTeam" TEXT NOT NULL,
  "scoreFor" INTEGER,
  "scoreAgainst" INTEGER,
  "result" TEXT NOT NULL,
  "watchType" TEXT NOT NULL,
  "stadium" TEXT,
  "seat" TEXT,
  "playerOfTheDay" TEXT,
  "highlight" TEXT NOT NULL,
  "rawMemo" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Photo" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "entryId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "fileName" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Photo_entryId_fkey"
    FOREIGN KEY ("entryId")
    REFERENCES "DiaryEntry" ("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "DiaryEntry_ownerId_seasonYear_idx"
  ON "DiaryEntry" ("ownerId", "seasonYear");

CREATE INDEX IF NOT EXISTS "DiaryEntry_favoriteTeam_date_idx"
  ON "DiaryEntry" ("favoriteTeam", "date");

CREATE INDEX IF NOT EXISTS "Photo_entryId_sortOrder_idx"
  ON "Photo" ("entryId", "sortOrder");

CREATE TABLE IF NOT EXISTS "SeasonBookProject" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "seasonYear" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "introText" TEXT,
  "coverPhotoUrl" TEXT NOT NULL,
  "selectedEntryIds" TEXT NOT NULL,
  "bookUid" TEXT,
  "orderUid" TEXT,
  "pageCount" INTEGER,
  "totalPrice" INTEGER,
  "currency" TEXT,
  "projectStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "orderStatus" TEXT NOT NULL DEFAULT 'UNPLACED',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SeasonBookProject_ownerId_seasonYear_idx"
  ON "SeasonBookProject" ("ownerId", "seasonYear");

CREATE INDEX IF NOT EXISTS "SeasonBookProject_bookUid_idx"
  ON "SeasonBookProject" ("bookUid");

CREATE INDEX IF NOT EXISTS "SeasonBookProject_orderUid_idx"
  ON "SeasonBookProject" ("orderUid");
