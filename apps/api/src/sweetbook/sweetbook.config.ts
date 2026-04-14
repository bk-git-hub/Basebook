import { loadApiEnv } from '../config/load-api-env';

const DEFAULT_SANDBOX_BASE_URL = 'https://api-sandbox.sweetbook.com/v1';
const PLACEHOLDER_API_KEY = 'your_sandbox_api_key_here';
const DEFAULT_BOOK_SPEC_UID = 'SQUAREBOOK_HC';
const DEFAULT_COVER_TEMPLATE_UID = '4MY2fokVjkeY';
const DEFAULT_CONTENT_TEMPLATE_UID = '3FhSEhJ94c0T';
const DEFAULT_BLANK_TEMPLATE_UID = '2mi1ao0Z4Vxl';
const DEFAULT_PUBLISH_TEMPLATE_UID = '75vMl9IeyPMI';

export type SweetbookConfig = {
  baseUrl: string;
  apiKey: string;
  estimateMode: SweetbookEstimateMode;
  orderMode: SweetbookOrderMode;
  bookSpecUid: string;
  coverTemplateUid: string;
  contentTemplateUid: string;
  blankTemplateUid: string;
  publishTemplateUid: string;
};

export type SweetbookEstimateMode = 'auto' | 'local' | 'sandbox';
export type SweetbookOrderMode = 'local' | 'sandbox';

export function getSweetbookConfig(env = process.env): SweetbookConfig {
  loadApiEnv();

  return {
    baseUrl: normalizeBaseUrl(
      env.SWEETBOOK_API_BASE_URL || DEFAULT_SANDBOX_BASE_URL,
    ),
    apiKey: (env.SWEETBOOK_API_KEY || '').trim(),
    estimateMode: normalizeEstimateMode(env.SWEETBOOK_ESTIMATE_MODE),
    orderMode: normalizeOrderMode(env.SWEETBOOK_ORDER_MODE),
    bookSpecUid: env.SWEETBOOK_BOOK_SPEC_UID || DEFAULT_BOOK_SPEC_UID,
    coverTemplateUid:
      env.SWEETBOOK_COVER_TEMPLATE_UID || DEFAULT_COVER_TEMPLATE_UID,
    contentTemplateUid:
      env.SWEETBOOK_CONTENT_TEMPLATE_UID || DEFAULT_CONTENT_TEMPLATE_UID,
    blankTemplateUid:
      env.SWEETBOOK_BLANK_TEMPLATE_UID || DEFAULT_BLANK_TEMPLATE_UID,
    publishTemplateUid:
      env.SWEETBOOK_PUBLISH_TEMPLATE_UID || DEFAULT_PUBLISH_TEMPLATE_UID,
  };
}

export function isConfiguredSweetbookApiKey(apiKey: string) {
  return Boolean(apiKey) && apiKey !== PLACEHOLDER_API_KEY;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/u, '');
}

function normalizeEstimateMode(value?: string): SweetbookEstimateMode {
  if (value === 'local' || value === 'sandbox') {
    return value;
  }

  return 'auto';
}

function normalizeOrderMode(value?: string): SweetbookOrderMode {
  if (value === 'sandbox') {
    return value;
  }

  return 'local';
}
