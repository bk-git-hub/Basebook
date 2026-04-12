import { EntriesModule } from './entries/entries.module';
import { Module } from '@nestjs/common';
import { GamesModule } from './games/games.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeasonBooksModule } from './season-books/season-books.module';
import { SweetbookModule } from './sweetbook/sweetbook.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    GamesModule,
    EntriesModule,
    UploadModule,
    SeasonBooksModule,
    SweetbookModule,
  ],
})
export class AppModule {}
