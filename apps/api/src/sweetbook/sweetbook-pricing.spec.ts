import { BadRequestException } from '@nestjs/common';
import { resolveSweetbookChargedCreditAmount } from './sweetbook-pricing';

describe('resolveSweetbookChargedCreditAmount', () => {
  it('returns paid credit amount when Sweetbook already provides it', () => {
    expect(
      resolveSweetbookChargedCreditAmount({
        totalAmount: 3100,
        paidCreditAmount: 3410,
      }),
    ).toBe(3410);
  });

  it('adds vat to subtotal when only order estimate amounts are available', () => {
    expect(
      resolveSweetbookChargedCreditAmount({
        totalAmount: 3100,
      }),
    ).toBe(3410);
  });

  it('builds subtotal from product, shipping, and packaging amounts', () => {
    expect(
      resolveSweetbookChargedCreditAmount({
        totalProductAmount: 100,
        totalShippingFee: 3000,
        totalPackagingFee: 0,
      }),
    ).toBe(3410);
  });

  it('throws when Sweetbook does not provide any usable pricing fields', () => {
    expect(() => resolveSweetbookChargedCreditAmount({})).toThrow(
      BadRequestException,
    );
  });
});
