import { ServiceUnavailableException } from '@nestjs/common';
import { R2ImageStorageService } from './r2-image-storage.service';

describe('R2ImageStorageService', () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      UPLOAD_STORAGE_DRIVER: 'r2',
      R2_ACCOUNT_ID: 'account-id',
      R2_ACCESS_KEY_ID: 'access-key-id',
      R2_SECRET_ACCESS_KEY: 'secret-access-key',
      R2_BUCKET: 'basebook-assets',
      R2_PUBLIC_BASE_URL: 'https://assets.example.com',
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('uploads images to the configured R2 bucket and returns a public URL', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const asset = await new R2ImageStorageService().storeImage({
      buffer: Buffer.from('image-bytes'),
      originalName: 'cover.png',
      mimeType: 'image/png',
    });

    expect(asset.fileName).toMatch(/^uploads\/\d{4}-\d{2}-\d{2}\/.+\.png$/u);
    expect(asset.url).toMatch(/^https:\/\/assets\.example\.com\/uploads\//u);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://account-id.r2.cloudflarestorage.com/basebook-assets/uploads/',
      ),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('AWS4-HMAC-SHA256'),
          'Content-Type': 'image/png',
          Host: 'account-id.r2.cloudflarestorage.com',
          'x-amz-content-sha256': expect.any(String),
          'x-amz-date': expect.any(String),
        }),
        body: Buffer.from('image-bytes'),
      }),
    );
  });

  it('fails clearly when R2 is not configured', async () => {
    process.env.R2_SECRET_ACCESS_KEY = 'your_r2_secret_access_key_here';

    await expect(
      new R2ImageStorageService().storeImage({
        buffer: Buffer.from('image-bytes'),
        originalName: 'cover.png',
        mimeType: 'image/png',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
