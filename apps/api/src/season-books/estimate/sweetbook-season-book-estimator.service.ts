import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Photo } from '@prisma/client';
import {
  SweetbookClient,
  type SweetbookBookSpec,
} from '../../sweetbook/sweetbook.client';
import { getSweetbookConfig } from '../../sweetbook/sweetbook.config';
import type {
  SeasonBookEstimateInput,
  SeasonBookEstimateResult,
  SeasonBookEstimatorPort,
} from './season-book-estimator.port';

const DEFAULT_IMAGE_URL = 'https://placehold.co/1200x900/png?text=Basebook';
const PUBLISHER_NAME = 'Basebook';

@Injectable()
export class SweetbookSeasonBookEstimatorService implements SeasonBookEstimatorPort {
  constructor(private readonly sweetbookClient: SweetbookClient) {}

  async estimate(
    input: SeasonBookEstimateInput,
  ): Promise<SeasonBookEstimateResult> {
    this.assertReadyForEstimate(input);

    const config = getSweetbookConfig();
    const externalRef = `basebook-estimate-${randomUUID()}`;
    const bookSpec = await this.resolveBookSpec(config.bookSpecUid);
    const book = await this.sweetbookClient.createBook({
      title: input.title,
      bookSpecUid: config.bookSpecUid,
      externalRef,
      idempotencyKey: externalRef,
    });

    await this.sweetbookClient.createCover(
      book.bookUid,
      config.coverTemplateUid,
      {
        frontPhoto: input.coverPhotoUrl,
        backPhoto: input.coverPhotoUrl,
        dateRange: this.formatDateRange(input),
        spineTitle: input.title,
      },
    );

    let pageCount = 0;

    for (const entry of input.entries) {
      const content = await this.sweetbookClient.insertContent(
        book.bookUid,
        config.contentTemplateUid,
        {
          photo1: this.resolvePublicPhotoUrl(entry.photos, input.coverPhotoUrl),
          date: this.formatEntryDate(entry.date),
          title:
            entry.playerOfTheDay ||
            `${entry.favoriteTeam} vs ${entry.opponentTeam}`,
          diaryText: this.resolveDiaryText(entry),
        },
        'page',
      );
      pageCount = this.resolveCurrentPageCount(pageCount, content.pageCount);
    }

    const publishContent = await this.sweetbookClient.insertContent(
      book.bookUid,
      config.publishTemplateUid,
      {
        photo: input.coverPhotoUrl,
        title: input.title,
        publishDate: this.formatPublishDate(),
        author: 'Basebook fan',
        hashtags: '#Basebook #KBO #Sweetbook',
        publisher: PUBLISHER_NAME,
      },
      'page',
    );
    pageCount = this.resolveCurrentPageCount(
      pageCount,
      publishContent.pageCount,
    );

    pageCount = await this.padToMinimumPageCount(
      book.bookUid,
      config.blankTemplateUid,
      bookSpec,
      pageCount,
    );

    const finalization = await this.sweetbookClient.finalizeBook(book.bookUid);
    const finalPageCount =
      finalization.pageCount ?? Math.max(pageCount, bookSpec.pageMin);
    const estimate = await this.sweetbookClient.estimateOrder(book.bookUid);

    return {
      bookUid: book.bookUid,
      pageCount: finalPageCount,
      totalPrice: Math.round(estimate.totalAmount ?? 0),
      currency: 'KRW',
      creditSufficient: estimate.creditSufficient ?? true,
    };
  }

  isReadyForEstimate(input: SeasonBookEstimateInput) {
    if (!this.sweetbookClient.isConfigured()) {
      return false;
    }

    return this.hasPublicUrl(input.coverPhotoUrl);
  }

  private assertReadyForEstimate(input: SeasonBookEstimateInput) {
    if (!this.sweetbookClient.isConfigured()) {
      throw new BadRequestException(
        'Sweetbook Sandbox API key is not configured.',
      );
    }

    if (!this.hasPublicUrl(input.coverPhotoUrl)) {
      throw new BadRequestException(
        'Sweetbook estimate requires a public coverPhotoUrl. Localhost upload URLs cannot be fetched by Sweetbook.',
      );
    }
  }

  private async resolveBookSpec(bookSpecUid: string) {
    const response = await this.sweetbookClient.getBookSpecs();
    const specs = this.extractArray<SweetbookBookSpec>(response, 'bookSpecs');
    const bookSpec = specs.find((spec) => spec.bookSpecUid === bookSpecUid);

    if (!bookSpec) {
      throw new BadRequestException(
        `Sweetbook book spec ${bookSpecUid} is not available.`,
      );
    }

    return bookSpec;
  }

  private async padToMinimumPageCount(
    bookUid: string,
    blankTemplateUid: string,
    bookSpec: SweetbookBookSpec,
    currentPageCount: number,
  ) {
    let pageCount = currentPageCount;
    const safePageMin = bookSpec.pageMin || 24;
    const safePageIncrement = bookSpec.pageIncrement || 2;
    const targetPageCount =
      safePageMin +
      Math.max(0, Math.ceil((pageCount - safePageMin) / safePageIncrement)) *
        safePageIncrement;
    let safetyCounter = 0;

    while (pageCount < targetPageCount && safetyCounter < 24) {
      const content = await this.sweetbookClient.insertContent(
        bookUid,
        blankTemplateUid,
        {},
        'page',
      );
      pageCount = this.resolveCurrentPageCount(pageCount, content.pageCount);
      safetyCounter += 1;
    }

    return pageCount;
  }

  private resolveCurrentPageCount(
    currentPageCount: number,
    reportedPageCount?: number,
  ) {
    return Math.max(
      currentPageCount,
      reportedPageCount ?? currentPageCount + 1,
    );
  }

  private resolvePublicPhotoUrl(photos: Photo[], fallbackUrl: string) {
    const publicPhoto = photos.find((photo) => this.hasPublicUrl(photo.url));
    return publicPhoto?.url || fallbackUrl || DEFAULT_IMAGE_URL;
  }

  private hasPublicUrl(url: string) {
    try {
      const parsedUrl = new URL(url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }

      return !['localhost', '127.0.0.1', '0.0.0.0'].includes(
        parsedUrl.hostname,
      );
    } catch {
      return false;
    }
  }

  private extractArray<T>(response: unknown, key: string): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (response && typeof response === 'object') {
      const record = response as Record<string, unknown>;

      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }

    return [];
  }

  private formatDateRange(input: SeasonBookEstimateInput) {
    const dates = input.entries.map((entry) => entry.date).sort();
    return `${dates[0]} - ${dates[dates.length - 1]}`;
  }

  private formatEntryDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return `${parsedDate.getMonth() + 1}.${parsedDate.getDate()}`;
  }

  private formatPublishDate() {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  }

  private resolveDiaryText(entry: SeasonBookEstimateInput['entries'][number]) {
    return [entry.highlight, entry.rawMemo].filter(Boolean).join('\n\n');
  }
}
