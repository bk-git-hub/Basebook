import { ServiceUnavailableException } from '@nestjs/common';
import { SweetbookClient } from './sweetbook.client';

describe('SweetbookClient', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SWEETBOOK_API_BASE_URL: 'https://api-sandbox.sweetbook.com/v1',
      SWEETBOOK_API_KEY: 'SB.test-key',
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('sends sandbox requests with bearer auth', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await new SweetbookClient().getBookSpecs();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-sandbox.sweetbook.com/v1/book-specs?limit=100',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer SB.test-key',
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('reports readiness across Sweetbook read APIs', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    await expect(new SweetbookClient().checkReadiness()).resolves.toEqual({
      configured: true,
      bookSpecsReachable: true,
      templatesReachable: true,
      creditsReachable: true,
    });
  });

  it('fails safely when the sandbox key is missing', async () => {
    process.env.SWEETBOOK_API_KEY = 'your_sandbox_api_key_here';

    await expect(new SweetbookClient().getCredits()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
