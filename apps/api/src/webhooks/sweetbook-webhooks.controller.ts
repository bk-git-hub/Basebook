import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import type { SweetbookWebhookAckResponse } from '@basebook/contracts';
import type { Request } from 'express';
import { SweetbookWebhookDto } from './dto/sweetbook-webhook.dto';
import { SweetbookWebhooksService } from './sweetbook-webhooks.service';

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

@Controller('webhooks')
export class SweetbookWebhooksController {
  constructor(
    private readonly sweetbookWebhooksService: SweetbookWebhooksService,
  ) {}

  @Post('sweetbook')
  receiveSweetbookWebhook(
    @Body() body: SweetbookWebhookDto,
    @Headers('x-webhook-signature') signature: string | undefined,
    @Headers('x-webhook-timestamp') timestamp: string | undefined,
    @Req() req: RawBodyRequest,
  ): Promise<SweetbookWebhookAckResponse> {
    return this.sweetbookWebhooksService.handleSweetbookWebhook({
      body,
      signature,
      timestamp,
      rawBody: req.rawBody?.toString('utf8'),
    });
  }
}
