import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { getSweetbookConfig } from '../../sweetbook/sweetbook.config';
import { LocalSeasonBookEstimatorService } from './local-season-book-estimator.service';
import type {
  SeasonBookEstimateInput,
  SeasonBookEstimateResult,
  SeasonBookEstimatorPort,
} from './season-book-estimator.port';
import { SweetbookSeasonBookEstimatorService } from './sweetbook-season-book-estimator.service';

@Injectable()
export class SeasonBookEstimatorService implements SeasonBookEstimatorPort {
  constructor(
    private readonly localEstimator: LocalSeasonBookEstimatorService,
    private readonly sweetbookEstimator: SweetbookSeasonBookEstimatorService,
  ) {}

  estimate(input: SeasonBookEstimateInput): Promise<SeasonBookEstimateResult> {
    const config = getSweetbookConfig();

    if (config.estimateMode === 'local') {
      return this.localEstimator.estimate(input);
    }

    if (config.estimateMode === 'sandbox') {
      return this.sweetbookEstimator.estimate(input);
    }

    if (this.canUseSweetbook(input)) {
      return this.sweetbookEstimator.estimate(input);
    }

    return this.localEstimator.estimate(input);
  }

  private canUseSweetbook(input: SeasonBookEstimateInput) {
    try {
      return this.sweetbookEstimator.isReadyForEstimate(input);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        return false;
      }

      throw error;
    }
  }
}
