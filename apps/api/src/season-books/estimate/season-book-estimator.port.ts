import type { CurrencyCode } from '@basebook/contracts';
import type { DiaryEntry, Photo } from '@prisma/client';

export const SEASON_BOOK_ESTIMATOR = Symbol('SEASON_BOOK_ESTIMATOR');

export type SeasonBookEstimateInput = {
  title: string;
  introText?: string;
  coverPhotoUrl: string;
  entries: Array<DiaryEntry & { photos: Photo[] }>;
};

export type SeasonBookEstimateResult = {
  bookUid: string;
  pageCount: number;
  totalPrice: number;
  currency: CurrencyCode;
  creditSufficient: boolean;
};

export interface SeasonBookEstimatorPort {
  estimate(input: SeasonBookEstimateInput): Promise<SeasonBookEstimateResult>;
}
