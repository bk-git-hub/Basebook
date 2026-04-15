import { BadRequestException, Injectable } from '@nestjs/common';
import { SweetbookClient } from '../../sweetbook/sweetbook.client';
import { resolveSweetbookChargedCreditAmount } from '../../sweetbook/sweetbook-pricing';
import { mapSweetbookOrderStatus } from '../season-book-status';
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
      totalPrice: resolveSweetbookChargedCreditAmount({
        totalAmount: order.totalAmount,
        totalProductAmount: order.totalProductAmount,
        totalShippingFee: order.totalShippingFee,
        totalPackagingFee: order.totalPackagingFee,
        paidCreditAmount: order.paidCreditAmount,
      }),
      currency: 'KRW',
      orderStatus: mapSweetbookOrderStatus(order.orderStatus),
    };
  }
}
