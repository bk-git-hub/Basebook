import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  CancelSeasonBookOrderResponse,
  CurrencyCode,
  GetSeasonBookStatusResponse,
  SeasonBookEstimateResponse,
  SeasonBookOrderResponse,
  SeasonBookOrderStatus,
  SeasonBookProjectStatus,
  SeasonBookShippingInfo,
  UpdateSeasonBookShippingResponse,
} from '@basebook/contracts';
import { randomUUID } from 'node:crypto';
import { DEMO_OWNER_ID } from '../entries/demo-owner';
import { PrismaService } from '../prisma/prisma.service';
import { SweetbookClient } from '../sweetbook/sweetbook.client';
import type { CancelSeasonBookOrderDto } from './dto/cancel-season-book-order.dto';
import type { EstimateSeasonBookDto } from './dto/estimate-season-book.dto';
import type { OrderSeasonBookDto } from './dto/order-season-book.dto';
import type { UpdateSeasonBookShippingDto } from './dto/update-season-book-shipping.dto';
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
import type {
  GetSeasonBookOrdersResponse,
  SeasonBookOrderHistoryItem,
} from './season-books.types';

type PersistedSeasonBookProjectStatus =
  | 'DRAFT'
  | 'ESTIMATED'
  | 'ORDERED'
  | 'FAILED';

type PersistedSeasonBookOrderStatus =
  | 'UNPLACED'
  | 'PAID'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'CANCELLED_REFUND'
  | 'ERROR'
  | 'UNKNOWN';

type OrderHistoryProjectRecord = {
  id: string;
  seasonYear: number;
  title: string;
  bookUid: string | null;
  orderUid: string | null;
  pageCount: number | null;
  totalPrice: number | null;
  currency: string | null;
  projectStatus: string;
  orderStatus: string;
  createdAt: Date;
  updatedAt: Date;
};

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

  async getSeasonBookOrders(): Promise<GetSeasonBookOrdersResponse> {
    const projects = await this.prisma.seasonBookProject.findMany({
      where: {
        ownerId: DEMO_OWNER_ID,
        orderUid: {
          not: null,
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      orders: projects.flatMap((project) => {
        const orderHistoryItem = this.toOrderHistoryItem(project);
        return orderHistoryItem ? [orderHistoryItem] : [];
      }),
    };
  }

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
      throw new NotFoundException(
        `Season book project not found: ${projectId}`,
      );
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
      shipping: this.buildShippingSnapshot(project),
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

  async cancelSeasonBookOrder(
    projectId: string,
    body: CancelSeasonBookOrderDto,
  ): Promise<CancelSeasonBookOrderResponse> {
    const project = await this.prisma.seasonBookProject.findFirst({
      where: {
        id: projectId,
        ownerId: DEMO_OWNER_ID,
      },
    });

    if (!project) {
      throw new NotFoundException(
        `Season book project not found: ${projectId}`,
      );
    }

    if (!project.orderUid) {
      throw new BadRequestException(
        'Season book project does not have an order to cancel.',
      );
    }

    if (
      project.orderStatus === 'CANCELLED' ||
      project.orderStatus === 'CANCELLED_REFUND'
    ) {
      return {
        projectId: project.id,
        orderUid: project.orderUid,
        projectStatus: project.projectStatus as SeasonBookProjectStatus,
        orderStatus: project.orderStatus as SeasonBookOrderStatus,
        cancelReason: body.cancelReason,
        cancelledAt: project.updatedAt.toISOString(),
      };
    }

    const cancelResult = await this.cancelOrder(
      project.orderUid,
      body.cancelReason,
    );

    const cancelledProject = await this.prisma.seasonBookProject.update({
      where: {
        id: project.id,
      },
      data: {
        projectStatus: 'ORDERED',
        orderStatus: cancelResult.orderStatus as PersistedSeasonBookOrderStatus,
      },
    });

    return {
      projectId: cancelledProject.id,
      orderUid: cancelledProject.orderUid ?? project.orderUid,
      projectStatus: cancelledProject.projectStatus as SeasonBookProjectStatus,
      orderStatus: cancelledProject.orderStatus as SeasonBookOrderStatus,
      cancelReason: cancelResult.cancelReason,
      refundAmount: cancelResult.refundAmount,
      cancelledAt: cancelResult.cancelledAt,
    };
  }

  async updateSeasonBookShipping(
    projectId: string,
    body: UpdateSeasonBookShippingDto,
  ): Promise<UpdateSeasonBookShippingResponse> {
    const project = await this.prisma.seasonBookProject.findFirst({
      where: {
        id: projectId,
        ownerId: DEMO_OWNER_ID,
      },
    });

    if (!project) {
      throw new NotFoundException(
        `Season book project not found: ${projectId}`,
      );
    }

    if (!project.orderUid) {
      throw new BadRequestException(
        'Season book project does not have an order to update.',
      );
    }

    this.ensureShippingUpdateRequested(body);
    this.ensureShippingUpdatable(
      project.orderStatus as SeasonBookOrderStatus,
      project.orderUid,
    );

    const shipping = this.resolveShippingInfo(project, body);
    const refreshedOrder = await this.updateOrderShipping(
      project.orderUid,
      shipping,
    );
    const nextOrderStatus = refreshedOrder?.orderStatus
      ? mapSweetbookOrderStatus(refreshedOrder.orderStatus)
      : (project.orderStatus as SeasonBookOrderStatus);

    const updatedProject = await this.prisma.seasonBookProject.update({
      where: {
        id: project.id,
      },
      data: {
        recipientName: shipping.recipientName,
        recipientPhone: shipping.recipientPhone,
        postalCode: shipping.postalCode,
        address1: shipping.address1,
        address2: shipping.address2 ?? null,
        shippingMemo: shipping.shippingMemo ?? null,
        orderStatus: nextOrderStatus as PersistedSeasonBookOrderStatus,
      },
    });

    return {
      projectId: updatedProject.id,
      orderUid: updatedProject.orderUid ?? project.orderUid,
      projectStatus:
        updatedProject.projectStatus as PersistedSeasonBookProjectStatus,
      orderStatus: updatedProject.orderStatus as PersistedSeasonBookOrderStatus,
      shipping,
      updatedAt: updatedProject.updatedAt.toISOString(),
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
        recipientName: body.recipientName,
        recipientPhone: body.recipientPhone,
        postalCode: body.postalCode,
        address1: body.address1,
        address2: body.address2,
        projectStatus: 'ORDERED',
        orderStatus: order.orderStatus as PersistedSeasonBookOrderStatus,
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

  private async cancelOrder(orderUid: string, cancelReason: string) {
    if (orderUid.startsWith('local-order-')) {
      return {
        orderStatus: 'CANCELLED_REFUND' as const,
        cancelReason,
        refundAmount: undefined,
        cancelledAt: new Date().toISOString(),
      };
    }

    if (!this.sweetbookClient.isConfigured()) {
      throw new BadRequestException(
        'Sweetbook order cancellation requires a configured Sandbox API key.',
      );
    }

    const cancelledOrder = await this.sweetbookClient.cancelOrder(
      orderUid,
      cancelReason,
    );

    return {
      orderStatus: mapSweetbookOrderStatus(cancelledOrder.orderStatus),
      cancelReason: cancelledOrder.cancelReason ?? cancelReason,
      refundAmount: cancelledOrder.refundAmount,
      cancelledAt: cancelledOrder.cancelledAt,
    };
  }

  private async updateOrderShipping(
    orderUid: string,
    shipping: SeasonBookShippingInfo,
  ) {
    if (orderUid.startsWith('local-order-')) {
      return null;
    }

    if (!this.sweetbookClient.isConfigured()) {
      throw new BadRequestException(
        'Sweetbook shipping update requires a configured Sandbox API key.',
      );
    }

    return this.sweetbookClient.updateOrderShipping(orderUid, shipping);
  }

  private ensureShippingUpdateRequested(body: UpdateSeasonBookShippingDto) {
    const requestedValues = [
      body.recipientName,
      body.recipientPhone,
      body.postalCode,
      body.address1,
      body.address2,
      body.shippingMemo,
    ];

    if (requestedValues.every((value) => value === undefined)) {
      throw new BadRequestException(
        'At least one shipping field must be provided for update.',
      );
    }
  }

  private ensureShippingUpdatable(
    orderStatus: SeasonBookOrderStatus,
    orderUid: string,
  ) {
    const allowedStatuses: SeasonBookOrderStatus[] = ['PAID', 'CONFIRMED'];

    if (allowedStatuses.includes(orderStatus)) {
      return;
    }

    throw new BadRequestException(
      `Shipping can only be updated before shipment. Current order ${orderUid} status is ${orderStatus}.`,
    );
  }

  private resolveShippingInfo(
    project: {
      recipientName: string | null;
      recipientPhone: string | null;
      postalCode: string | null;
      address1: string | null;
      address2: string | null;
      shippingMemo: string | null;
    },
    body: UpdateSeasonBookShippingDto,
  ): SeasonBookShippingInfo {
    return {
      recipientName: this.resolveRequiredShippingField(
        'recipientName',
        body.recipientName,
        project.recipientName,
      ),
      recipientPhone: this.resolveRequiredShippingField(
        'recipientPhone',
        body.recipientPhone,
        project.recipientPhone,
      ),
      postalCode: this.resolveRequiredShippingField(
        'postalCode',
        body.postalCode,
        project.postalCode,
      ),
      address1: this.resolveRequiredShippingField(
        'address1',
        body.address1,
        project.address1,
      ),
      address2: this.normalizeOptionalShippingField(
        body.address2 ?? project.address2 ?? undefined,
      ),
      shippingMemo: this.normalizeOptionalShippingField(
        body.shippingMemo ?? project.shippingMemo ?? undefined,
      ),
    };
  }

  private buildShippingSnapshot(project: {
    recipientName: string | null;
    recipientPhone: string | null;
    postalCode: string | null;
    address1: string | null;
    address2: string | null;
    shippingMemo: string | null;
  }): SeasonBookShippingInfo | undefined {
    if (
      !project.recipientName ||
      !project.recipientPhone ||
      !project.postalCode ||
      !project.address1
    ) {
      return undefined;
    }

    return {
      recipientName: project.recipientName,
      recipientPhone: project.recipientPhone,
      postalCode: project.postalCode,
      address1: project.address1,
      address2: project.address2 ?? undefined,
      shippingMemo: project.shippingMemo ?? undefined,
    };
  }

  private resolveRequiredShippingField(
    fieldName: 'recipientName' | 'recipientPhone' | 'postalCode' | 'address1',
    requestedValue: string | undefined,
    existingValue: string | null,
  ) {
    const nextValue = (requestedValue ?? existingValue ?? '').trim();

    if (!nextValue) {
      throw new BadRequestException(
        `Shipping update requires a non-empty ${fieldName} value.`,
      );
    }

    return nextValue;
  }

  private normalizeOptionalShippingField(value: string | undefined) {
    const nextValue = value?.trim();
    return nextValue ? nextValue : undefined;
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
      projectStatus: project.projectStatus as PersistedSeasonBookProjectStatus,
      orderStatus: project.orderStatus as PersistedSeasonBookOrderStatus,
    };
  }

  private toOrderHistoryItem(
    project: OrderHistoryProjectRecord,
  ): SeasonBookOrderHistoryItem | null {
    if (!project.orderUid || project.totalPrice === null || !project.currency) {
      this.logger.warn(
        `Skipping incomplete season-book order history record: ${project.id}`,
      );
      return null;
    }

    return {
      projectId: project.id,
      seasonYear: project.seasonYear,
      title: project.title,
      bookUid: project.bookUid ?? undefined,
      orderUid: project.orderUid,
      pageCount: project.pageCount ?? undefined,
      totalPrice: project.totalPrice,
      currency: project.currency as CurrencyCode,
      projectStatus: project.projectStatus as PersistedSeasonBookProjectStatus,
      orderStatus: project.orderStatus as PersistedSeasonBookOrderStatus,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
