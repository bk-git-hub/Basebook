import { ServiceUnavailableException } from '@nestjs/common';
import { SeasonBookEstimatorService } from './season-book-estimator.service';

jest.mock('../../sweetbook/sweetbook.config', () => ({
  getSweetbookConfig: jest.fn(),
}));

const {
  getSweetbookConfig,
} = jest.requireMock('../../sweetbook/sweetbook.config') as {
  getSweetbookConfig: jest.Mock;
};

describe('SeasonBookEstimatorService', () => {
  const localEstimator = {
    estimate: jest.fn(),
  };
  const sweetbookEstimator = {
    estimate: jest.fn(),
    isReadyForEstimate: jest.fn(),
  };

  const service = new SeasonBookEstimatorService(
    localEstimator as never,
    sweetbookEstimator as never,
  );

  const estimateInput = {
    title: '2026 두산 시즌북',
    coverPhotoUrl: 'https://assets.example.com/cover.jpg',
    entries: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forces Sweetbook pricing when sandbox order mode is enabled', async () => {
    getSweetbookConfig.mockReturnValue({
      estimateMode: 'auto',
      orderMode: 'sandbox',
    });
    sweetbookEstimator.estimate.mockResolvedValue({
      bookUid: 'bk_1',
      pageCount: 24,
      totalPrice: 3410,
      currency: 'KRW',
      creditSufficient: true,
    });

    await expect(service.estimate(estimateInput)).resolves.toEqual({
      bookUid: 'bk_1',
      pageCount: 24,
      totalPrice: 3410,
      currency: 'KRW',
      creditSufficient: true,
    });
    expect(sweetbookEstimator.estimate).toHaveBeenCalledWith(estimateInput);
    expect(localEstimator.estimate).not.toHaveBeenCalled();
  });

  it('keeps local fallback only when sandbox order mode is not required', async () => {
    getSweetbookConfig.mockReturnValue({
      estimateMode: 'auto',
      orderMode: 'local',
    });
    sweetbookEstimator.isReadyForEstimate.mockImplementation(() => {
      throw new ServiceUnavailableException('not configured');
    });
    localEstimator.estimate.mockResolvedValue({
      bookUid: 'local-book-1',
      pageCount: 24,
      totalPrice: 28200,
      currency: 'KRW',
      creditSufficient: true,
    });

    await expect(service.estimate(estimateInput)).resolves.toEqual({
      bookUid: 'local-book-1',
      pageCount: 24,
      totalPrice: 28200,
      currency: 'KRW',
      creditSufficient: true,
    });
    expect(localEstimator.estimate).toHaveBeenCalledWith(estimateInput);
  });
});
