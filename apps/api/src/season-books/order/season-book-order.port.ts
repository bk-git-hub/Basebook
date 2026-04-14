import type { CurrencyCode, SeasonBookOrderStatus } from '@basebook/contracts';

export const SEASON_BOOK_ORDER_PLACER = Symbol('SEASON_BOOK_ORDER_PLACER');

export type SeasonBookOrderInput = {
  projectId: string;
  bookUid: string;
  totalPrice: number;
  currency: CurrencyCode;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address1: string;
  address2?: string;
};

export type SeasonBookOrderResult = {
  orderUid: string;
  totalPrice: number;
  currency: CurrencyCode;
  orderStatus: SeasonBookOrderStatus;
};

export interface SeasonBookOrderPlacerPort {
  placeOrder(input: SeasonBookOrderInput): Promise<SeasonBookOrderResult>;
}
