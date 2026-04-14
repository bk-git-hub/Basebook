import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  SeasonBookOrderInput,
  SeasonBookOrderPlacerPort,
  SeasonBookOrderResult,
} from './season-book-order.port';

@Injectable()
export class LocalSeasonBookOrderService implements SeasonBookOrderPlacerPort {
  async placeOrder(
    input: SeasonBookOrderInput,
  ): Promise<SeasonBookOrderResult> {
    return {
      orderUid: `local-order-${randomUUID()}`,
      totalPrice: input.totalPrice,
      currency: input.currency,
      orderStatus: 'CONFIRMED',
    };
  }
}
