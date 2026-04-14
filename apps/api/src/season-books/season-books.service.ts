import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  CurrencyCode,
  GetSeasonBookStatusResponse,
  SeasonBookEstimateResponse,
  SeasonBookOrderResponse,
  SeasonBookOrderStatus,
  SeasonBookProjectStatus,
} from '@basebook/contracts';
import { randomUUID } from 'node:crypto';
import { DEMO_OWNER_ID } from '../entries/demo-owner';
import { PrismaService } from '../prisma/prisma.service';
import { SweetbookClient } from '../sweetbook/sweetbook.client';
import type { EstimateSeasonBookDto } from './dto/estimate-season-book.dto';
import type { OrderSeasonBookDto } from './dto/order-season-book.dto';
import {
  SEASON_BOOK_ESTIMATOR,
  type SeasonBookEstimatorPort,
} from './estimate/season-book-estimator.port';
import {
  SEASON_BOOK_ORDER_PLACER,
  type SeasonBookOrderPlacerPort,
} from './order/season-book-order.port';
import {
  buildProgressTimeline,
  mapSweetbookOrderStatus,
  resolveProgressStepKey,
} from './season-book-status';

@Injectable()
export class SeasonBooksService {
  private readonly logger = new Logger(SeasonBooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SEASON_BOOK_ESTIMATOR)
    private readonly estimator: SeasonBookEstimatorPort,
    @Inject(SEASON_BOOK_ORDER_PLACER)
    private readonly orderPlacer: SeasonBookOrderPlacerPort,
    private readonly sweetbookClient: SweetbookClient,
  ) {}

  async getSeasonBookStatus(
    projectId: string,
  ): Promise<GetSeasonBookStatusResponse> {
    const project = await this.prisma.seasonBookProject.findFirst({
      where: {
        id: projectId,
        ownerId: DEMO_OWNER_ID,
      },
    });

    if (!project) {
      throw new NotFoundException(`Season book project not found: ${projectId}`);
    }

    const sweetbookStatus = await this.tryRefreshSweetbookOrderStatus(
      project.orderUid,
    );
    const orderStatus = sweetbookStatus?.orderStatus
      ? sweetbookStatus.orderStatus
      : (project.orderStatus as SeasonBookOrderStatus);
    const occurredAt =
      sweetbookStatus?.orderedAt ??
      (project.orderUid ? project.updatedAt.toISOString() : undefined);

    return {
      projectId: project.id,
      bookUid: project.bookUid ?? undefined,
      orderUid: project.orderUid ?? undefined,
      projectStatus: project.projectStatus as SeasonBookProjectStatus,
      orderStatus,
      source: sweetbookStatus ? 'SWEETBOOK' : 'LOCAL',
      sweetbookStatusCode: sweetbookStatus?.statusCode,
      sweetbookStatusDisplay: sweetbookStatus?.statusDisplay,
      progress: buildProgressTimeline(
        resolveProgressStepKey({
          orderStatus,
          sweetbookStatusCode: sweetbookStatus?.statusCode,
        }),
        occurredAt,
      ),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  async estimateSeasonBook(
    body: EstimateSeasonBookDto,
  ): Promise<SeasonBookEstimateResponse> {
    const selectedEntryIds = this.ensureUniqueEntryIds(body.selectedEntryIds);
    const entries = await this.prisma.diaryEntry.findMany({
      where: {
        ownerId: DEMO_OWNER_ID,
        id: {
          in: selectedEntryIds,
        },
      },
      include: {
        photos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });

    if (entries.length !== selectedEntryIds.length) {
      const foundEntryIds = new Set(entries.map((entry) => entry.id));
      const missingEntryIds = selectedEntryIds.filter(
        (entryId) => !foundEntryIds.has(entryId),
      );
      throw new NotFoundException(
        `Entries not found: ${missingEntryIds.join(', ')}`,
      );
    }

    const estimate = await this.estimator.estimate({
      title: body.title,
      introText: body.introText,
      coverPhotoUrl: body.coverPhotoUrl,
      entries,
    });

    const project = await this.prisma.seasonBookProject.create({
      data: {
        id: randomUUID(),
        ownerId: DEMO_OWNER_ID,
        seasonYear: body.seasonYear,
        title: body.title,
        introText: body.introText,
        coverPhotoUrl: body.coverPhotoUrl,
        selectedEntryIds: JSON.stringify(selectedEntryIds),
        bookUid: estimate.bookUid,
        pageCount: estimate.pageCount,
        totalPrice: estimate.totalPrice,
        currency: estimate.currency,
        projectStatus: 'ESTIMATED',
        orderStatus: 'UNPLACED',
      },
    });

    return {
      projectId: project.id,
      bookUid: project.bookUid ?? estimate.bookUid,
      pageCount: project.pageCount ?? estimate.pageCount,
      totalPrice: project.totalPrice ?? estimate.totalPrice,
      currency: (project.currency ?? estimate.currency) as CurrencyCode,
      projectStatus: project.projectStatus as SeasonBookProjectStatus,
      creditSufficient: estimate.creditSufficient,
    };
  }

  async orderSeasonBook(
    body: OrderSeasonBookDto,
  ): Promise<SeasonBookOrderResponse> {
    const project = await this.prisma.seasonBookProject.findFirst({
      where: {
        id: body.projectId,
        ownerId: DEMO_OWNER_ID,
      },
    });

    if (!project) {
      throw new NotFoundException(
        `Season book project not found: ${body.projectId}`,
      );
    }

    if (project.orderUid) {
      return this.toOrderResponse(project);
    }

    if (project.projectStatus !== 'ESTIMATED' || !project.bookUid) {
      throw new BadRequestException(
        'Season book project must be estimated before ordering.',
      );
    }

    if (project.totalPrice === null || !project.currency) {
      throw new BadRequestException(
        'Season book project is missing estimate pricing.',
      );
    }

    const order = await this.orderPlacer.placeOrder({
      projectId: project.id,
      bookUid: project.bookUid,
      totalPrice: project.totalPrice,
      currency: project.currency as CurrencyCode,
      recipientName: body.recipientName,
      recipientPhone: body.recipientPhone,
      postalCode: body.postalCode,
      address1: body.address1,
      address2: body.address2,
    });

    const orderedProject = await this.prisma.seasonBookProject.update({
      where: {
        id: project.id,
      },
      data: {
        orderUid: order.orderUid,
        totalPrice: order.totalPrice,
        currency: order.currency,
        projectStatus: 'ORDERED',
        orderStatus: order.orderStatus,
      },
    });

    return this.toOrderResponse(orderedProject);
  }

  private ensureUniqueEntryIds(entryIds: string[]) {
    const uniqueEntryIds = [...new Set(entryIds)];

    if (uniqueEntryIds.length !== entryIds.length) {
      throw new BadRequestException('Selected entry ids must be unique.');
    }

    return uniqueEntryIds;
  }

  private async tryRefreshSweetbookOrderStatus(orderUid: string | null) {
    if (
      !orderUid ||
      !orderUid.startsWith('or_') ||
      !this.sweetbookClient.isConfigured()
    ) {
      return null;
    }

    try {
      const order = await this.sweetbookClient.getOrder(orderUid);

      return {
        orderStatus: mapSweetbookOrderStatus(order.orderStatus),
        statusCode: order.orderStatus,
        statusDisplay: order.orderStatusDisplay,
        orderedAt: order.orderedAt,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Sweetbook error';

      this.logger.warn(
        `Failed to refresh Sweetbook order status for ${orderUid}: ${message}`,
      );
      return null;
    }
  }

  private toOrderResponse(project: {
    id: string;
    orderUid: string | null;
    totalPrice: number | null;
    currency: string | null;
    projectStatus: string;
    orderStatus: string;
  }): SeasonBookOrderResponse {
    if (!project.orderUid || project.totalPrice === null || !project.currency) {
      throw new BadRequestException(
        'Season book project is not ready for order response.',
      );
    }

    return {
      projectId: project.id,
      orderUid: project.orderUid,
      totalPrice: project.totalPrice,
      currency: project.currency as CurrencyCode,
      projectStatus: project.projectStatus as SeasonBookProjectStatus,
      orderStatus: project.orderStatus as SeasonBookOrderStatus,
    };
  }
}
