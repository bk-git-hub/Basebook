import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

let hasLoadedApiEnv = false;

export function loadApiEnv() {
  if (hasLoadedApiEnv) {
    return;
  }

  const apiRoot = resolve(__dirname, '..', '..');
  const envPath = resolve(apiRoot, '.env');
  const fallbackEnvPath = resolve(apiRoot, '.env.example');
  const envFilePath = existsSync(envPath) ? envPath : fallbackEnvPath;

  if (existsSync(envFilePath)) {
    config({ path: envFilePath });
  }

  hasLoadedApiEnv = true;
}

