import { getUploadStorageConfig } from './upload-storage.config';

describe('getUploadStorageConfig', () => {
  it('defaults to local storage', () => {
    expect(getUploadStorageConfig({}).driver).toBe('local');
  });

  it('detects a fully configured R2 storage target', () => {
    const config = getUploadStorageConfig({
      UPLOAD_STORAGE_DRIVER: 'auto',
      R2_ACCOUNT_ID: 'account-id',
      R2_ACCESS_KEY_ID: 'access-key-id',
      R2_SECRET_ACCESS_KEY: 'secret-access-key',
      R2_BUCKET: 'basebook-assets',
      R2_PUBLIC_BASE_URL: 'https://assets.example.com/',
    });

    expect(config.driver).toBe('auto');
    expect(config.r2.configured).toBe(true);
    expect(config.r2.publicBaseUrl).toBe('https://assets.example.com');
  });
});
