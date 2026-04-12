import { Module } from '@nestjs/common';
import { SweetbookModule } from '../sweetbook/sweetbook.module';
import { LocalSeasonBookEstimatorService } from './estimate/local-season-book-estimator.service';
import { SeasonBookEstimatorService } from './estimate/season-book-estimator.service';
import { SEASON_BOOK_ESTIMATOR } from './estimate/season-book-estimator.port';
import { SweetbookSeasonBookEstimatorService } from './estimate/sweetbook-season-book-estimator.service';
import { SeasonBooksController } from './season-books.controller';
import { SeasonBooksService } from './season-books.service';

@Module({
  imports: [SweetbookModule],
  controllers: [SeasonBooksController],
  providers: [
    SeasonBooksService,
    SeasonBookEstimatorService,
    LocalSeasonBookEstimatorService,
    SweetbookSeasonBookEstimatorService,
    {
      provide: SEASON_BOOK_ESTIMATOR,
      useExisting: SeasonBookEstimatorService,
    },
  ],
})
export class SeasonBooksModule {}
