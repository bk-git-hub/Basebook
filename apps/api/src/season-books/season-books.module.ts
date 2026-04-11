import { Module } from '@nestjs/common';
import { LocalSeasonBookEstimatorService } from './estimate/local-season-book-estimator.service';
import { SEASON_BOOK_ESTIMATOR } from './estimate/season-book-estimator.port';
import { SeasonBooksController } from './season-books.controller';
import { SeasonBooksService } from './season-books.service';

@Module({
  controllers: [SeasonBooksController],
  providers: [
    SeasonBooksService,
    LocalSeasonBookEstimatorService,
    {
      provide: SEASON_BOOK_ESTIMATOR,
      useExisting: LocalSeasonBookEstimatorService,
    },
  ],
})
export class SeasonBooksModule {}
