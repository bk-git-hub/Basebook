const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const dotenv = require('dotenv');

const apiRoot = resolve(__dirname, '..');
const envPath = resolve(apiRoot, '.env');
const fallbackEnvPath = resolve(apiRoot, '.env.example');
const envFilePath = existsSync(envPath) ? envPath : fallbackEnvPath;

if (existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
}

const defaultBaseUrl = 'https://api-sandbox.sweetbook.com/v1';
const baseUrl = (process.env.SWEETBOOK_API_BASE_URL || defaultBaseUrl).replace(
  /\/+$/u,
  '',
);
const apiKey = (process.env.SWEETBOOK_API_KEY || '').trim();

const isPlaceholderKey = !apiKey || apiKey === 'your_sandbox_api_key_here';

if (isPlaceholderKey) {
  console.error(
    'Sweetbook sandbox check skipped: Sandbox API key is not configured.',
  );
  console.error(
    'Set SWEETBOOK_API_KEY in apps/api/.env or the current shell, then rerun this command.',
  );
  process.exit(1);
}

async function checkPath(label, path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`${label}: failed with HTTP ${response.status}`);
    return false;
  }

  console.log(`${label}: reachable`);
  return true;
}

async function main() {
  const checks = await Promise.all([
    checkPath('book-specs', '/book-specs?limit=5'),
    checkPath('templates', '/templates?limit=5'),
    checkPath('credits', '/credits'),
  ]);

  if (checks.every(Boolean)) {
    console.log('Sweetbook sandbox readiness check passed.');
    return;
  }

  process.exit(1);
}

main().catch((error) => {
  console.error(
    `Sweetbook sandbox check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
  );
  process.exit(1);
});
