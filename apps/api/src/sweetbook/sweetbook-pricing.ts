import { BadRequestException } from '@nestjs/common';

type SweetbookPricingInput = {
  totalAmount?: number;
  totalProductAmount?: number;
  totalShippingFee?: number;
  totalPackagingFee?: number;
  paidCreditAmount?: number;
};

const VAT_RATE = 0.1;

export function resolveSweetbookChargedCreditAmount(
  input: SweetbookPricingInput,
) {
  if (typeof input.paidCreditAmount === 'number' && input.paidCreditAmount > 0) {
    return Math.round(input.paidCreditAmount);
  }

  const subtotal = resolveSweetbookSubtotal(input);

  return Math.round(subtotal * (1 + VAT_RATE));
}

function resolveSweetbookSubtotal(input: SweetbookPricingInput) {
  if (typeof input.totalAmount === 'number' && input.totalAmount > 0) {
    return input.totalAmount;
  }

  const subtotal =
    (input.totalProductAmount ?? 0) +
    (input.totalShippingFee ?? 0) +
    (input.totalPackagingFee ?? 0);

  if (subtotal > 0) {
    return subtotal;
  }

  throw new BadRequestException(
    'Sweetbook pricing response did not include a usable amount.',
  );
}
