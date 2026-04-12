import { loadApiEnv } from '../../config/load-api-env';

export type UploadStorageDriver = 'local' | 'r2' | 'auto';

export type R2StorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
  configured: boolean;
};

export type UploadStorageConfig = {
  driver: UploadStorageDriver;
  r2: R2StorageConfig;
};

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_cloudflare_account_id_here',
  'your_r2_access_key_id_here',
  'your_r2_secret_access_key_here',
  'your_r2_bucket_name_here',
  'https://your-public-r2-domain.example.com',
]);

export function getUploadStorageConfig(env = process.env): UploadStorageConfig {
  loadApiEnv();

  const r2 = {
    accountId: (env.R2_ACCOUNT_ID || '').trim(),
    accessKeyId: (env.R2_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (env.R2_SECRET_ACCESS_KEY || '').trim(),
    bucket: (env.R2_BUCKET || '').trim(),
    publicBaseUrl: (env.R2_PUBLIC_BASE_URL || '').trim().replace(/\/+$/u, ''),
  };

  const configured = Object.values(r2).every(
    (value) => !PLACEHOLDER_VALUES.has(value),
  );

  return {
    driver: normalizeDriver(env.UPLOAD_STORAGE_DRIVER),
    r2: {
      ...r2,
      configured,
    },
  };
}

function normalizeDriver(value?: string): UploadStorageDriver {
  if (value === 'r2' || value === 'auto') {
    return value;
  }

  return 'local';
}
