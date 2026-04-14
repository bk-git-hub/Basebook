const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const apiRoot = resolve(__dirname, '..');
const envPath = resolve(apiRoot, '.env');
const fallbackEnvPath = resolve(apiRoot, '.env.example');

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

async function main() {
  loadEnv();
  runPrismaInit();
  await ensureSeasonBookProjectColumns();
}

main().catch((error) => {
  console.error('Failed to initialize SQLite schema.', error);
  process.exit(1);
});
