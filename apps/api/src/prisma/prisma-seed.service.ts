import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { DiaryEntry } from '@basebook/contracts';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaSeedService implements OnModuleInit {
  private readonly logger = new Logger(PrismaSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedIfEmpty();
  }

  async seedIfEmpty() {
    const entryCount = await this.prisma.diaryEntry.count();
    if (entryCount > 0) {
      return;
    }

    await this.resetDemoEntries();
    this.logger.log('Seeded demo entries into SQLite.');
  }

  async resetDemoEntries() {
    const demoEntries = this.readDemoEntries();

    await this.prisma.photo.deleteMany();
    await this.prisma.diaryEntry.deleteMany();

    for (const entry of demoEntries) {
      await this.prisma.diaryEntry.create({
        data: {
          id: entry.id,
          ownerId: entry.ownerId,
          gameId: entry.gameId,
          seasonYear: entry.seasonYear,
          date: entry.date,
          favoriteTeam: entry.favoriteTeam,
          opponentTeam: entry.opponentTeam,
          scoreFor: entry.scoreFor,
          scoreAgainst: entry.scoreAgainst,
          result: entry.result,
          watchType: entry.watchType,
          stadium: entry.stadium,
          seat: entry.seat,
          playerOfTheDay: entry.playerOfTheDay,
          highlight: entry.highlight,
          rawMemo: entry.rawMemo,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
          photos: {
            create: entry.photos.map((photo, index) => ({
              id: photo.id,
              url: photo.url,
              fileName: photo.fileName,
              sortOrder: index,
            })),
          },
        },
      });
    }
  }

  private readDemoEntries(): DiaryEntry[] {
    const filePath = resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'data',
      'demo-entries.json',
    );
    const rawJson = readFileSync(filePath, 'utf-8');
    return JSON.parse(rawJson) as DiaryEntry[];
  }
}
