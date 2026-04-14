import { Module } from '@nestjs/common';
import { SweetbookWebhooksController } from './sweetbook-webhooks.controller';
import { SweetbookWebhooksService } from './sweetbook-webhooks.service';

@Module({
  controllers: [SweetbookWebhooksController],
  providers: [SweetbookWebhooksService],
})
export class WebhooksModule {}
