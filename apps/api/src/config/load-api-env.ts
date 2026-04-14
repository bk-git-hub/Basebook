import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

let hasLoadedApiEnv = false;

function shouldLoadFallbackEnvExample(env = process.env) {
  const runningOnRailway = Boolean(
    env.RAILWAY_PROJECT_ID ||
      env.RAILWAY_ENVIRONMENT_ID ||
      env.RAILWAY_SERVICE_ID,
  );

  return !runningOnRailway && env.NODE_ENV !== 'production';
}

export function loadApiEnv() {
  if (hasLoadedApiEnv) {
    return;
  }

  const apiRoot = resolve(__dirname, '..', '..');
  const envPath = resolve(apiRoot, '.env');
  const fallbackEnvPath = resolve(apiRoot, '.env.example');
  const envFilePath = existsSync(envPath)
    ? envPath
    : shouldLoadFallbackEnvExample()
      ? fallbackEnvPath
      : null;

  if (envFilePath && existsSync(envFilePath)) {
    config({ path: envFilePath });
  }

  hasLoadedApiEnv = true;
}
