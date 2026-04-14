const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const apiRoot = resolve(__dirname, '..');
const envPath = resolve(apiRoot, '.env');
const fallbackEnvPath = resolve(apiRoot, '.env.example');
const demoEntriesPath = resolve(apiRoot, '..', '..', 'data', 'demo-entries.json');

function shouldLoadFallbackEnvExample(env = process.env) {
  const runningOnRailway = Boolean(
    env.RAILWAY_PROJECT_ID ||
      env.RAILWAY_ENVIRONMENT_ID ||
      env.RAILWAY_SERVICE_ID,
  );

  return !runningOnRailway && env.NODE_ENV !== 'production';
}

function loadEnv() {
  const envFilePath = existsSync(envPath)
    ? envPath
    : shouldLoadFallbackEnvExample()
      ? fallbackEnvPath
      : null;

  if (envFilePath && existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
  }
}

function readDemoEntries() {
  return JSON.parse(readFileSync(demoEntriesPath, 'utf-8'));
}

async function main() {
  loadEnv();

  const prisma = new PrismaClient();
  const demoEntries = readDemoEntries();

  try {
    await prisma.seasonBookProject.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.diaryEntry.deleteMany();

    for (const entry of demoEntries) {
      await prisma.diaryEntry.create({
        data: {
          id: entry.id,
          ownerId: entry.ownerId,
          gameId: entry.gameId,
          seasonYear: entry.seasonYear,
          date: entry.date,
          favoriteTeam: entry.favoriteTeam,
          opponentTeam: entry.opponentTeam,
          scoreFor: entry.scoreFor,
          scoreAgainst: entry.scoreAgainst,
          result: entry.result,
          watchType: entry.watchType,
          stadium: entry.stadium,
          seat: entry.seat,
          playerOfTheDay: entry.playerOfTheDay,
          highlight: entry.highlight,
          rawMemo: entry.rawMemo,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
          photos: {
            create: entry.photos.map((photo, index) => ({
              id: photo.id,
              url: photo.url,
              fileName: photo.fileName,
              sortOrder: index,
            })),
          },
        },
      });
    }

    console.log(
      JSON.stringify({
        ok: true,
        count: demoEntries.length,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'Failed to reset demo entries.',
  );
  process.exit(1);
});
