import { loadApiEnv } from '../config/load-api-env';

const DEFAULT_SANDBOX_BASE_URL = 'https://api-sandbox.sweetbook.com/v1';
const PLACEHOLDER_API_KEY = 'your_sandbox_api_key_here';

export type SweetbookConfig = {
  baseUrl: string;
  apiKey: string;
};

export function getSweetbookConfig(env = process.env): SweetbookConfig {
  loadApiEnv();

  return {
    baseUrl: normalizeBaseUrl(
      env.SWEETBOOK_API_BASE_URL || DEFAULT_SANDBOX_BASE_URL,
    ),
    apiKey: (env.SWEETBOOK_API_KEY || '').trim(),
  };
}

export function isConfiguredSweetbookApiKey(apiKey: string) {
  return Boolean(apiKey) && apiKey !== PLACEHOLDER_API_KEY;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/u, '');
}
