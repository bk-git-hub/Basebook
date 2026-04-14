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

  it('creates orders with an idempotency key and shipping payload', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        data: {
          orderUid: 'or_test123',
          orderStatus: 20,
          totalAmount: 15000,
        },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      new SweetbookClient().createOrder({
        bookUid: 'bk_test123',
        recipientName: '홍길동',
        recipientPhone: '010-1234-5678',
        postalCode: '06236',
        address1: '서울특별시 강남구 테헤란로 123',
        address2: '4층',
        externalRef: 'basebook-order-project-1',
        idempotencyKey: 'basebook-order-project-1',
      }),
    ).resolves.toEqual({
      orderUid: 'or_test123',
      orderStatus: 20,
      totalAmount: 15000,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-sandbox.sweetbook.com/v1/orders',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer SB.test-key',
          'Content-Type': 'application/json',
          'Idempotency-Key': 'basebook-order-project-1',
        }),
        body: JSON.stringify({
          items: [
            {
              bookUid: 'bk_test123',
              quantity: 1,
            },
          ],
          shipping: {
            recipientName: '홍길동',
            recipientPhone: '010-1234-5678',
            postalCode: '06236',
            address1: '서울특별시 강남구 테헤란로 123',
            address2: '4층',
          },
          externalRef: 'basebook-order-project-1',
        }),
      }),
    );
  });

  it('fetches order detail by order uid', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          orderUid: 'or_test123',
          orderStatus: 25,
          orderStatusDisplay: 'PDF 준비 완료',
          orderedAt: '2026-04-14T03:07:00Z',
        },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(new SweetbookClient().getOrder('or_test123')).resolves.toEqual({
      orderUid: 'or_test123',
      orderStatus: 25,
      orderStatusDisplay: 'PDF 준비 완료',
      orderedAt: '2026-04-14T03:07:00Z',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-sandbox.sweetbook.com/v1/orders/or_test123',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer SB.test-key',
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('fails safely when the sandbox key is missing', async () => {
    process.env.SWEETBOOK_API_KEY = 'your_sandbox_api_key_here';

    await expect(new SweetbookClient().getCredits()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
