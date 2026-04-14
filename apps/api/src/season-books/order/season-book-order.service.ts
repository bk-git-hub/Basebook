import { Injectable } from '@nestjs/common';
import { getSweetbookConfig } from '../../sweetbook/sweetbook.config';
import { LocalSeasonBookOrderService } from './local-season-book-order.service';
import type {
  SeasonBookOrderInput,
  SeasonBookOrderPlacerPort,
  SeasonBookOrderResult,
} from './season-book-order.port';
import { SweetbookSeasonBookOrderService } from './sweetbook-season-book-order.service';

@Injectable()
export class SeasonBookOrderService implements SeasonBookOrderPlacerPort {
  constructor(
    private readonly localOrderService: LocalSeasonBookOrderService,
    private readonly sweetbookOrderService: SweetbookSeasonBookOrderService,
  ) {}

  placeOrder(input: SeasonBookOrderInput): Promise<SeasonBookOrderResult> {
    const config = getSweetbookConfig();

    if (config.orderMode === 'sandbox') {
      return this.sweetbookOrderService.placeOrder(input);
    }

    return this.localOrderService.placeOrder(input);
  }
}
