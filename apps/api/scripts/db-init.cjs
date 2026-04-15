const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const apiRoot = resolve(__dirname, '..');
const envPath = resolve(apiRoot, '.env');
const fallbackEnvPath = resolve(apiRoot, '.env.example');
const KNOWN_INVALID_DEMO_PHOTO_URLS = [
  'https://pub-721a4bb10d7944d1891213efbc66e17e.r2.dev/uploads/2026-04-14/74bed418-47d4-4343-9050-ca3abcfe2f5b.jpg',
  'https://pub-721a4bb10d7944d1891213efbc66e17e.r2.dev/uploads/2026-04-15/96714c19-4598-4735-8853-e88e25172e2f.png',
];
const LOCAL_DASHBOARD_DEMO_ENTRY_PATCHES = [
  {
    id: 'entry-doosan-2026-03-22',
    expectedWatchType: 'TV',
    data: {
      watchType: 'STADIUM',
      stadium: '잠실야구장',
      seat: '1루 테이블석 102블록 3열',
      rawMemo:
        '개막 시리즈라 잠실 분위기가 일찍부터 뜨거웠다. 7회 역전 분위기 때 응원석 전체가 일어났다.',
    },
  },
  {
    id: 'entry-doosan-2026-04-02',
    expectedWatchType: 'MOBILE',
    data: {
      watchType: 'STADIUM',
      stadium: '잠실야구장',
      seat: '1루 내야 205블록 8열',
      rawMemo:
        '평일 잠실 직관이었는데 마지막 이닝 동점 상황 때문에 끝까지 자리에서 못 일어났다.',
    },
  },
];

function shouldLoadFallbackEnvExample(env = process.env) {
  const runningOnRailway = Boolean(
    env.RAILWAY_PROJECT_ID ||
      env.RAILWAY_ENVIRONMENT_ID ||
      env.RAILWAY_SERVICE_ID,
  );

  return !runningOnRailway && env.NODE_ENV !== 'production';
}

const quoteForCmd = (value) => {
  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
};

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

function runPrismaInit() {
  const command = [
    'prisma',
    'db',
    'execute',
    '--file',
    'prisma/init.sql',
    '--schema',
    'prisma/schema.prisma',
  ];

  const result =
    process.platform === 'win32'
      ? spawnSync(
          process.env.ComSpec || 'cmd.exe',
          ['/d', '/s', '/c', command.map(quoteForCmd).join(' ')],
          {
            cwd: apiRoot,
            env: process.env,
            stdio: 'inherit',
          },
        )
      : spawnSync(command[0], command.slice(1), {
          cwd: apiRoot,
          env: process.env,
          stdio: 'inherit',
        });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function ensureSeasonBookProjectColumns() {
  const prisma = new PrismaClient();
  const columnsToAdd = [
    'recipientName',
    'recipientPhone',
    'postalCode',
    'address1',
    'address2',
    'shippingMemo',
  ];

  try {
    const existingColumns = await prisma.$queryRawUnsafe(
      'PRAGMA table_info("SeasonBookProject")',
    );
    const existingColumnNames = new Set(
      existingColumns.map((column) => String(column.name)),
    );

    for (const columnName of columnsToAdd) {
      if (existingColumnNames.has(columnName)) {
        continue;
      }

      await prisma.$executeRawUnsafe(
        `ALTER TABLE "SeasonBookProject" ADD COLUMN "${columnName}" TEXT`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function removeKnownInvalidDemoPhotos() {
  const prisma = new PrismaClient();

  try {
    const result = await prisma.photo.deleteMany({
      where: {
        url: {
          in: KNOWN_INVALID_DEMO_PHOTO_URLS,
        },
      },
    });

    if (result.count > 0) {
      console.log(
        `Removed ${result.count} invalid demo photo reference(s) from the database.`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function synchronizeLocalDashboardDemoEntries() {
  const prisma = new PrismaClient();

  try {
    let updatedCount = 0;

    for (const patch of LOCAL_DASHBOARD_DEMO_ENTRY_PATCHES) {
      const result = await prisma.diaryEntry.updateMany({
        where: {
          id: patch.id,
          ownerId: 'demo-user-001',
          watchType: patch.expectedWatchType,
        },
        data: patch.data,
      });

      updatedCount += result.count;
    }

    if (updatedCount > 0) {
      console.log(
        `Updated ${updatedCount} local demo entr${updatedCount === 1 ? 'y' : 'ies'} for stadium summary compatibility.`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  loadEnv();
  runPrismaInit();
  await ensureSeasonBookProjectColumns();
  await removeKnownInvalidDemoPhotos();
  await synchronizeLocalDashboardDemoEntries();
}

main().catch((error) => {
  console.error('Failed to initialize SQLite schema.', error);
  process.exit(1);
});
