import type {
  SeasonBookOrderStatus,
  SeasonBookProgressStep,
  SeasonBookProgressStepKey,
} from '@basebook/contracts';

const PROGRESS_STEPS: ReadonlyArray<{
  key: SeasonBookProgressStepKey;
  label: string;
}> = [
  { key: 'PAID', label: '결제완료' },
  { key: 'PDF_READY', label: 'PDF 준비 완료' },
  { key: 'CONFIRMED', label: '제작확정' },
  { key: 'IN_PRODUCTION', label: '제작중' },
  { key: 'PRODUCTION_COMPLETE', label: '제작완료' },
  { key: 'SHIPPED', label: '발송완료' },
  { key: 'DELIVERED', label: '배송완료' },
];

export function mapSweetbookOrderStatus(
  status?: number,
): SeasonBookOrderStatus {
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

  if (status === 80) {
    return 'CANCELLED';
  }

  if (status === 81) {
    return 'CANCELLED_REFUND';
  }

  if (status === 90) {
    return 'ERROR';
  }

  return 'UNKNOWN';
}

export function resolveProgressStepKey(input: {
  orderStatus: SeasonBookOrderStatus;
  sweetbookStatusCode?: number;
}): SeasonBookProgressStepKey | null {
  if (input.sweetbookStatusCode === 20) {
    return 'PAID';
  }

  if (input.sweetbookStatusCode === 25) {
    return 'PDF_READY';
  }

  if (input.sweetbookStatusCode === 30) {
    return 'CONFIRMED';
  }

  if (input.sweetbookStatusCode === 40 || input.sweetbookStatusCode === 45) {
    return 'IN_PRODUCTION';
  }

  if (input.sweetbookStatusCode === 50) {
    return 'PRODUCTION_COMPLETE';
  }

  if (input.sweetbookStatusCode === 60) {
    return 'SHIPPED';
  }

  if (input.sweetbookStatusCode === 70) {
    return 'DELIVERED';
  }

  if (input.orderStatus === 'PAID') {
    return 'PAID';
  }

  if (input.orderStatus === 'CONFIRMED') {
    return 'CONFIRMED';
  }

  if (input.orderStatus === 'IN_PRODUCTION') {
    return 'IN_PRODUCTION';
  }

  if (input.orderStatus === 'SHIPPED') {
    return 'SHIPPED';
  }

  if (input.orderStatus === 'DELIVERED') {
    return 'DELIVERED';
  }

  if (
    input.orderStatus === 'CANCELLED' ||
    input.orderStatus === 'CANCELLED_REFUND' ||
    input.orderStatus === 'ERROR' ||
    input.orderStatus === 'UNKNOWN'
  ) {
    return null;
  }

  return null;
}

export function buildProgressTimeline(
  currentStepKey: SeasonBookProgressStepKey | null,
  occurredAt?: string,
): SeasonBookProgressStep[] {
  const currentIndex = currentStepKey
    ? PROGRESS_STEPS.findIndex((step) => step.key === currentStepKey)
    : -1;

  return PROGRESS_STEPS.map((step, index) => ({
    key: step.key,
    label: step.label,
    state:
      currentIndex === -1
        ? 'pending'
        : index < currentIndex
          ? 'completed'
          : index === currentIndex
            ? 'current'
            : 'pending',
    occurredAt:
      currentIndex !== -1 && index <= currentIndex && occurredAt
        ? occurredAt
        : undefined,
  }));
}
