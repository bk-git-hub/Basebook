import { Module } from '@nestjs/common';
import { SweetbookClient } from './sweetbook.client';

@Module({
  providers: [SweetbookClient],
  exports: [SweetbookClient],
})
export class SweetbookModule {}
