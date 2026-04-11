import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  SeasonBookEstimateInput,
  SeasonBookEstimateResult,
  SeasonBookEstimatorPort,
} from './season-book-estimator.port';

@Injectable()
export class LocalSeasonBookEstimatorService implements SeasonBookEstimatorPort {
  private readonly minPageCount = 24;
  private readonly maxPageCount = 130;
  private readonly pageIncrement = 2;
  private readonly basePrice = 12000;
  private readonly pricePerPage = 550;
  private readonly shippingPrice = 3000;

  async estimate(
    input: SeasonBookEstimateInput,
  ): Promise<SeasonBookEstimateResult> {
    const introPages = input.introText ? 2 : 0;
    const coverAndIndexPages = 2;
    const entryPages = input.entries.length * 2;
    const rawPageCount = coverAndIndexPages + introPages + entryPages;
    const pageCount = this.normalizePageCount(rawPageCount);

    return {
      bookUid: `local-book-${randomUUID()}`,
      pageCount,
      totalPrice:
        this.basePrice + pageCount * this.pricePerPage + this.shippingPrice,
      currency: 'KRW',
      creditSufficient: true,
    };
  }

  private normalizePageCount(pageCount: number) {
    const boundedPageCount = Math.min(
      Math.max(pageCount, this.minPageCount),
      this.maxPageCount,
    );
    const extraPages = boundedPageCount - this.minPageCount;
    return (
      this.minPageCount +
      Math.ceil(extraPages / this.pageIncrement) * this.pageIncrement
    );
  }
}
