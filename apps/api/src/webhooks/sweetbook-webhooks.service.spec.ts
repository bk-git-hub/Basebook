import { UnauthorizedException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { SweetbookWebhooksService } from './sweetbook-webhooks.service';

describe('SweetbookWebhooksService', () => {
  const originalEnv = { ...process.env };
  const prisma = {
    seasonBookProject: {
      updateMany: jest.fn(),
    },
  } as unknown as PrismaService;

  const service = new SweetbookWebhooksService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    prisma.seasonBookProject.updateMany.mockResolvedValue({ count: 1 });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('applies a shipping delivery webhook to the matching order', async () => {
    await expect(
      service.handleSweetbookWebhook({
        body: {
          event_uid: 'evt_1',
          event_type: 'shipping.delivered',
          created_at: '2026-04-14T05:00:00Z',
          data: {
            orderUid: 'local-order-1',
            shipping: {
              recipientName: '홍길동',
              recipientPhone: '010-1234-5678',
              postalCode: '06236',
              address1: '서울특별시 강남구 테헤란로 123',
            },
          },
        },
      }),
    ).resolves.toEqual({ received: true });

    expect(prisma.seasonBookProject.updateMany).toHaveBeenCalledWith({
      where: {
        orderUid: 'local-order-1',
      },
      data: expect.objectContaining({
        projectStatus: 'ORDERED',
        orderStatus: 'DELIVERED',
      }),
    });
  });

  it('rejects invalid signatures when a webhook secret is configured', async () => {
    process.env.SWEETBOOK_WEBHOOK_SECRET = 'secret-key';

    await expect(
      service.handleSweetbookWebhook({
        body: {
          event_uid: 'evt_2',
          event_type: 'order.created',
          created_at: '2026-04-14T05:00:00Z',
          data: {
            orderUid: 'or_test_1',
          },
        },
        rawBody: JSON.stringify({
          event_uid: 'evt_2',
          event_type: 'order.created',
          created_at: '2026-04-14T05:00:00Z',
          data: {
            orderUid: 'or_test_1',
          },
        }),
        timestamp: '1713070800',
        signature: 'sha256=invalid',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
