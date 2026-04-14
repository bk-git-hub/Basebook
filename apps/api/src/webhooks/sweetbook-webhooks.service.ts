import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  SeasonBookOrderStatus,
  SweetbookWebhookAckResponse,
  SweetbookWebhookEventType,
} from '@basebook/contracts';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { SweetbookWebhookDto } from './dto/sweetbook-webhook.dto';

type PersistedSeasonBookOrderStatus =
  | 'UNPLACED'
  | 'PAID'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'CANCELLED_REFUND'
  | 'ERROR'
  | 'UNKNOWN';

@Injectable()
export class SweetbookWebhooksService {
  private readonly logger = new Logger(SweetbookWebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleSweetbookWebhook(input: {
    body: SweetbookWebhookDto;
    rawBody?: string;
    signature?: string;
    timestamp?: string;
  }): Promise<SweetbookWebhookAckResponse> {
    this.verifySignatureIfConfigured(input);

    const orderUid = this.extractOrderUid(input.body.data);
    const nextOrderStatus = this.mapEventToOrderStatus(
      input.body.event_type,
      input.body.data,
    );

    if (!orderUid || !nextOrderStatus) {
      this.logger.log(
        `Ignored Sweetbook webhook ${input.body.event_uid} (${input.body.event_type}) because it did not map to a tracked order update.`,
      );
      return { received: true };
    }

    const shipping = this.extractShippingSnapshot(input.body.data);

    const updateResult = await this.prisma.seasonBookProject.updateMany({
      where: {
        orderUid,
      },
      data: {
        projectStatus: 'ORDERED',
        orderStatus: nextOrderStatus,
        recipientName: shipping?.recipientName,
        recipientPhone: shipping?.recipientPhone,
        postalCode: shipping?.postalCode,
        address1: shipping?.address1,
        address2: shipping?.address2 ?? null,
        shippingMemo: shipping?.shippingMemo ?? null,
      },
    });

    if (updateResult.count === 0) {
      this.logger.warn(
        `Sweetbook webhook ${input.body.event_uid} referenced unknown orderUid ${orderUid}.`,
      );
      return { received: true };
    }

    this.logger.log(
      `Applied Sweetbook webhook ${input.body.event_uid} to ${orderUid} with status ${nextOrderStatus}.`,
    );

    return { received: true };
  }

  private verifySignatureIfConfigured(input: {
    body: SweetbookWebhookDto;
    rawBody?: string;
    signature?: string;
    timestamp?: string;
  }) {
    const secret = process.env.SWEETBOOK_WEBHOOK_SECRET?.trim();

    if (!secret) {
      return;
    }

    if (!input.signature || !input.timestamp) {
      throw new UnauthorizedException(
        'Sweetbook webhook signature headers are required.',
      );
    }

    if (!input.rawBody) {
      throw new BadRequestException(
        'Sweetbook webhook raw body is required for signature verification.',
      );
    }

    const signedPayload = `${input.timestamp}.${input.rawBody}`;
    const expectedSignature = `sha256=${createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex')}`;

    const providedBuffer = Buffer.from(input.signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException(
        'Sweetbook webhook signature is invalid.',
      );
    }
  }

  private extractOrderUid(data: Record<string, unknown>) {
    const candidates = [
      data.orderUid,
      data.order_uid,
      this.readNestedValue(data.order, 'orderUid'),
      this.readNestedValue(data.order, 'order_uid'),
    ];

    return candidates.find(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    );
  }

  private mapEventToOrderStatus(
    eventType: SweetbookWebhookEventType,
    data: Record<string, unknown>,
  ): PersistedSeasonBookOrderStatus | null {
    switch (eventType) {
      case 'order.created':
      case 'order.restored':
        return 'PAID';
      case 'order.cancelled':
        return this.hasRefundAmount(data) ? 'CANCELLED_REFUND' : 'CANCELLED';
      case 'production.confirmed':
        return 'CONFIRMED';
      case 'production.started':
      case 'production.completed':
        return 'IN_PRODUCTION';
      case 'shipping.departed':
        return 'SHIPPED';
      case 'shipping.delivered':
        return 'DELIVERED';
      default:
        return null;
    }
  }

  private hasRefundAmount(data: Record<string, unknown>) {
    const refundCandidates = [
      data.refundAmount,
      data.refund_amount,
      this.readNestedValue(data.order, 'refundAmount'),
      this.readNestedValue(data.order, 'refund_amount'),
    ];

    return refundCandidates.some(
      (value) =>
        typeof value === 'number' && Number.isFinite(value) && value > 0,
    );
  }

  private extractShippingSnapshot(data: Record<string, unknown>) {
    const source =
      this.readRecord(data.shipping) ??
      this.readRecord(this.readNestedValue(data.order, 'shipping'));

    if (!source) {
      return undefined;
    }

    const recipientName = this.readString(source.recipientName);
    const recipientPhone = this.readString(source.recipientPhone);
    const postalCode = this.readString(source.postalCode);
    const address1 = this.readString(source.address1);

    if (!recipientName || !recipientPhone || !postalCode || !address1) {
      return undefined;
    }

    return {
      recipientName,
      recipientPhone,
      postalCode,
      address1,
      address2: this.readString(source.address2),
      shippingMemo: this.readString(
        source.shippingMemo ?? source.shipping_memo ?? source.memo,
      ),
    };
  }

  private readNestedValue(
    input: unknown,
    key: string,
  ): string | number | Record<string, unknown> | undefined {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return undefined;
    }

    const value = (input as Record<string, unknown>)[key];

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      (value && typeof value === 'object' && !Array.isArray(value))
    ) {
      return value as string | number | Record<string, unknown>;
    }

    return undefined;
  }

  private readRecord(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return undefined;
    }

    return input as Record<string, unknown>;
  }

  private readString(input: unknown) {
    if (typeof input !== 'string') {
      return undefined;
    }

    const normalized = input.trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}
