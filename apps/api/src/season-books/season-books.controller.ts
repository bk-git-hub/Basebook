import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type {
  CancelSeasonBookOrderResponse,
  GetSeasonBookStatusResponse,
  SeasonBookEstimateResponse,
  SeasonBookOrderResponse,
  UpdateSeasonBookShippingResponse,
} from '@basebook/contracts';
import { CancelSeasonBookOrderDto } from './dto/cancel-season-book-order.dto';
import { EstimateSeasonBookDto } from './dto/estimate-season-book.dto';
import { OrderSeasonBookDto } from './dto/order-season-book.dto';
import { UpdateSeasonBookShippingDto } from './dto/update-season-book-shipping.dto';
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

  @Post(':projectId/cancel')
  cancelSeasonBookOrder(
    @Param('projectId') projectId: string,
    @Body() body: CancelSeasonBookOrderDto,
  ): Promise<CancelSeasonBookOrderResponse> {
    return this.seasonBooksService.cancelSeasonBookOrder(projectId, body);
  }

  @Patch(':projectId/shipping')
  updateSeasonBookShipping(
    @Param('projectId') projectId: string,
    @Body() body: UpdateSeasonBookShippingDto,
  ): Promise<UpdateSeasonBookShippingResponse> {
    return this.seasonBooksService.updateSeasonBookShipping(projectId, body);
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
