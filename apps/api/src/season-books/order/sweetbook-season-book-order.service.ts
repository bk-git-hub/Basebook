import { BadRequestException, Injectable } from '@nestjs/common';
import type { SeasonBookOrderStatus } from '@basebook/contracts';
import { SweetbookClient } from '../../sweetbook/sweetbook.client';
import type {
  SeasonBookOrderInput,
  SeasonBookOrderPlacerPort,
  SeasonBookOrderResult,
} from './season-book-order.port';

@Injectable()
export class SweetbookSeasonBookOrderService implements SeasonBookOrderPlacerPort {
  constructor(private readonly sweetbookClient: SweetbookClient) {}

  async placeOrder(
    input: SeasonBookOrderInput,
  ): Promise<SeasonBookOrderResult> {
    const externalRef = `basebook-order-${input.projectId}`;
    const order = await this.sweetbookClient.createOrder({
      bookUid: input.bookUid,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      postalCode: input.postalCode,
      address1: input.address1,
      address2: input.address2,
      externalRef,
      idempotencyKey: externalRef,
    });

    if (!order.orderUid) {
      throw new BadRequestException(
        'Sweetbook order response did not include an orderUid.',
      );
    }

    return {
      orderUid: order.orderUid,
      totalPrice: Math.round(order.totalAmount ?? input.totalPrice),
      currency: 'KRW',
      orderStatus: this.mapSweetbookOrderStatus(order.orderStatus),
    };
  }

  private mapSweetbookOrderStatus(status?: number): SeasonBookOrderStatus {
    if (status === 20 || status === 25) {
      return 'PAID';
    }

    if (status === 30) {
      return 'CONFIRMED';
    }

    if (status === 40 || status === 45 || status === 50) {
      return 'IN_PRODUCTION';
    }

    if (status === 60) {
      return 'SHIPPED';
    }

    if (status === 70) {
      return 'DELIVERED';
    }

    return 'UNKNOWN';
  }
}
