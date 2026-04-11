import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CurrencyCode,
  SeasonBookEstimateResponse,
  SeasonBookProjectStatus,
} from '@basebook/contracts';
import { randomUUID } from 'node:crypto';
import { DEMO_OWNER_ID } from '../entries/demo-owner';
import { PrismaService } from '../prisma/prisma.service';
import type { EstimateSeasonBookDto } from './dto/estimate-season-book.dto';
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

  private ensureUniqueEntryIds(entryIds: string[]) {
    const uniqueEntryIds = [...new Set(entryIds)];

    if (uniqueEntryIds.length !== entryIds.length) {
      throw new BadRequestException('Selected entry ids must be unique.');
    }

    return uniqueEntryIds;
  }
}
