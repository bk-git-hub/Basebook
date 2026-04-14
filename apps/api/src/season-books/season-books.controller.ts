import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type {
  GetSeasonBookStatusResponse,
  SeasonBookEstimateResponse,
  SeasonBookOrderResponse,
} from '@basebook/contracts';
import { EstimateSeasonBookDto } from './dto/estimate-season-book.dto';
import { OrderSeasonBookDto } from './dto/order-season-book.dto';
import { SeasonBooksService } from './season-books.service';

@Controller('season-books')
export class SeasonBooksController {
  constructor(private readonly seasonBooksService: SeasonBooksService) {}

  @Get(':projectId/status')
  getSeasonBookStatus(
    @Param('projectId') projectId: string,
  ): Promise<GetSeasonBookStatusResponse> {
    return this.seasonBooksService.getSeasonBookStatus(projectId);
  }

  @Post('estimate')
  estimateSeasonBook(
    @Body() body: EstimateSeasonBookDto,
  ): Promise<SeasonBookEstimateResponse> {
    return this.seasonBooksService.estimateSeasonBook(body);
  }

  @Post('order')
  orderSeasonBook(
    @Body() body: OrderSeasonBookDto,
  ): Promise<SeasonBookOrderResponse> {
    return this.seasonBooksService.orderSeasonBook(body);
  }
}
