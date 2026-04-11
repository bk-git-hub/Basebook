import { Body, Controller, Post } from '@nestjs/common';
import type { SeasonBookEstimateResponse } from '@basebook/contracts';
import { EstimateSeasonBookDto } from './dto/estimate-season-book.dto';
import { SeasonBooksService } from './season-books.service';

@Controller('season-books')
export class SeasonBooksController {
  constructor(private readonly seasonBooksService: SeasonBooksService) {}

  @Post('estimate')
  estimateSeasonBook(
    @Body() body: EstimateSeasonBookDto,
  ): Promise<SeasonBookEstimateResponse> {
    return this.seasonBooksService.estimateSeasonBook(body);
  }
}
