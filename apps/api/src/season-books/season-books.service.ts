import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CurrencyCode,
  SeasonBookEstimateResponse,
  SeasonBookOrderResponse,
  SeasonBookOrderStatus,
  SeasonBookProjectStatus,
} from '@basebook/contracts';
import { randomUUID } from 'node:crypto';
import { DEMO_OWNER_ID } from '../entries/demo-owner';
import { PrismaService } from '../prisma/prisma.service';
import type { EstimateSeasonBookDto } from './dto/estimate-season-book.dto';
import type { OrderSeasonBookDto } from './dto/order-season-book.dto';
import {
  SEASON_BOOK_ESTIMATOR,
  type SeasonBookEstimatorPort,
} from './estimate/season-book-estimator.port';

@Injectable()
export class SeasonBooksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SEASON_BOOK_ESTIMATOR)
    private readonly estimator: SeasonBookEstimatorPort,
  ) {}

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

    const orderedProject = await this.prisma.seasonBookProject.update({
      where: {
        id: project.id,
      },
      data: {
        orderUid: `local-order-${randomUUID()}`,
        projectStatus: 'ORDERED',
        orderStatus: 'CONFIRMED',
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
