import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { SweetbookClient } from '../sweetbook/sweetbook.client';
import { SeasonBooksService } from './season-books.service';

describe('SeasonBooksService', () => {
  const prisma = {
    seasonBookProject: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
  const estimator = {} as never;
  const orderPlacer = {} as never;
  const sweetbookClient = {
    isConfigured: jest.fn(),
    getOrder: jest.fn(),
    cancelOrder: jest.fn(),
  } as unknown as SweetbookClient;

  const service = new SeasonBooksService(
    prisma,
    estimator,
    orderPlacer,
    sweetbookClient,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns pending progress for estimated projects that were not ordered yet', async () => {
    prisma.seasonBookProject.findFirst.mockResolvedValue({
      id: 'project-1',
      ownerId: 'demo-user-001',
      bookUid: 'bk_local_1',
      orderUid: null,
      projectStatus: 'ESTIMATED',
      orderStatus: 'UNPLACED',
      updatedAt: new Date('2026-04-14T12:00:00Z'),
    });

    await expect(service.getSeasonBookStatus('project-1')).resolves.toEqual({
      projectId: 'project-1',
      bookUid: 'bk_local_1',
      orderUid: undefined,
      projectStatus: 'ESTIMATED',
      orderStatus: 'UNPLACED',
      source: 'LOCAL',
      sweetbookStatusCode: undefined,
      sweetbookStatusDisplay: undefined,
      progress: expect.arrayContaining([
        expect.objectContaining({ key: 'PAID', state: 'pending' }),
        expect.objectContaining({ key: 'DELIVERED', state: 'pending' }),
      ]),
      updatedAt: '2026-04-14T12:00:00.000Z',
    });
  });

  it('uses Sweetbook order detail when an external order exists', async () => {
    prisma.seasonBookProject.findFirst.mockResolvedValue({
      id: 'project-2',
      ownerId: 'demo-user-001',
      bookUid: 'bk_remote_1',
      orderUid: 'or_remote_1',
      projectStatus: 'ORDERED',
      orderStatus: 'PAID',
      updatedAt: new Date('2026-04-14T12:05:00Z'),
    });
    sweetbookClient.isConfigured.mockReturnValue(true);
    sweetbookClient.getOrder.mockResolvedValue({
      orderUid: 'or_remote_1',
      orderStatus: 25,
      orderStatusDisplay: 'PDF 준비 완료',
      orderedAt: '2026-04-14T03:07:00Z',
    });

    const status = await service.getSeasonBookStatus('project-2');

    expect(status).toEqual({
      projectId: 'project-2',
      bookUid: 'bk_remote_1',
      orderUid: 'or_remote_1',
      projectStatus: 'ORDERED',
      orderStatus: 'PAID',
      source: 'SWEETBOOK',
      sweetbookStatusCode: 25,
      sweetbookStatusDisplay: 'PDF 준비 완료',
      progress: [
        {
          key: 'PAID',
          label: '결제완료',
          state: 'completed',
          occurredAt: '2026-04-14T03:07:00Z',
        },
        {
          key: 'PDF_READY',
          label: 'PDF 준비 완료',
          state: 'current',
          occurredAt: '2026-04-14T03:07:00Z',
        },
        {
          key: 'CONFIRMED',
          label: '제작확정',
          state: 'pending',
          occurredAt: undefined,
        },
        {
          key: 'IN_PRODUCTION',
          label: '제작중',
          state: 'pending',
          occurredAt: undefined,
        },
        {
          key: 'PRODUCTION_COMPLETE',
          label: '제작완료',
          state: 'pending',
          occurredAt: undefined,
        },
        {
          key: 'SHIPPED',
          label: '발송완료',
          state: 'pending',
          occurredAt: undefined,
        },
        {
          key: 'DELIVERED',
          label: '배송완료',
          state: 'pending',
          occurredAt: undefined,
        },
      ],
      updatedAt: '2026-04-14T12:05:00.000Z',
    });
  });

  it('throws when the season-book project does not exist', async () => {
    prisma.seasonBookProject.findFirst.mockResolvedValue(null);

    await expect(service.getSeasonBookStatus('missing-project')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('cancels a local order while keeping the project in ordered history', async () => {
    prisma.seasonBookProject.findFirst.mockResolvedValue({
      id: 'project-3',
      ownerId: 'demo-user-001',
      orderUid: 'local-order-123',
      projectStatus: 'ORDERED',
      orderStatus: 'CONFIRMED',
      updatedAt: new Date('2026-04-14T13:00:00Z'),
    });
    prisma.seasonBookProject.update.mockResolvedValue({
      id: 'project-3',
      ownerId: 'demo-user-001',
      orderUid: 'local-order-123',
      projectStatus: 'ORDERED',
      orderStatus: 'CANCELLED_REFUND',
    });

    const result = await service.cancelSeasonBookOrder('project-3', {
      cancelReason: '테스트 취소',
    });

    expect(result.projectId).toBe('project-3');
    expect(result.orderUid).toBe('local-order-123');
    expect(result.projectStatus).toBe('ORDERED');
    expect(result.orderStatus).toBe('CANCELLED_REFUND');
    expect(result.cancelReason).toBe('테스트 취소');
    expect(prisma.seasonBookProject.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectStatus: 'ORDERED',
          orderStatus: 'CANCELLED_REFUND',
        }),
      }),
    );
  });
});
