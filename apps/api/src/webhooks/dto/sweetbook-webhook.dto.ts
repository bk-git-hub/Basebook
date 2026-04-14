import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type {
  SweetbookWebhookEventType,
  SweetbookWebhookRequest,
} from '@basebook/contracts';

const SWEETBOOK_WEBHOOK_EVENTS: SweetbookWebhookEventType[] = [
  'order.created',
  'order.cancelled',
  'order.restored',
  'production.confirmed',
  'production.started',
  'production.completed',
  'shipping.departed',
  'shipping.delivered',
];

export class SweetbookWebhookDto implements SweetbookWebhookRequest {
  @IsString()
  event_uid!: string;

  @IsString()
  @IsIn(SWEETBOOK_WEBHOOK_EVENTS)
  event_type!: SweetbookWebhookEventType;

  @IsString()
  @IsISO8601()
  created_at!: string;

  @IsObject()
  data!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isTest?: boolean;
}
