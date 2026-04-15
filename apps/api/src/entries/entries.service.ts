import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  DeleteEntryResponse,
  DiaryEntry,
  DiaryEntrySummary,
  GetEntriesQuery,
  GetEntriesResponse,
  GetEntryResponse,
  PhotoAsset,
  UpdateDiaryEntryInput,
} from '@basebook/contracts';
import type { Photo, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DEMO_OWNER_ID } from './demo-owner';
import type { CreateEntryDto } from './dto/create-entry.dto';

type DiaryEntryRecord = Prisma.DiaryEntryGetPayload<{
  include: {
    photos: {
      orderBy: {
        sortOrder: 'asc';
      };
    };
  };
}>;

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getEntries(query: GetEntriesQuery): Promise<GetEntriesResponse> {
    const entries = await this.prisma.diaryEntry.findMany({
      where: {
        ownerId: DEMO_OWNER_ID,
        favoriteTeam: query.favoriteTeam,
        seasonYear: query.seasonYear,
      },
      include: {
        photos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    const mappedEntries = entries.map((entry) => this.toDiaryEntry(entry));

    return {
      entries: mappedEntries,
      summary: this.buildSummary(mappedEntries),
    };
  }

  async getEntry(id: string): Promise<GetEntryResponse> {
    const entry = await this.prisma.diaryEntry.findFirst({
      where: {
        id,
        ownerId: DEMO_OWNER_ID,
      },
      include: {
        photos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(`Entry ${id} was not found`);
    }

    return {
      entry: this.toDiaryEntry(entry),
    };
  }

  async createEntry(body: CreateEntryDto): Promise<GetEntryResponse> {
    const entry = await this.prisma.diaryEntry.create({
      data: {
        id: randomUUID(),
        ownerId: DEMO_OWNER_ID,
        gameId: body.gameId,
        seasonYear: body.seasonYear,
        date: body.date,
        favoriteTeam: body.favoriteTeam,
        opponentTeam: body.opponentTeam,
        scoreFor: body.scoreFor,
        scoreAgainst: body.scoreAgainst,
        result: body.result,
        watchType: body.watchType,
        stadium: body.stadium,
        seat: body.seat,
        playerOfTheDay: body.playerOfTheDay,
        highlight: body.highlight,
        rawMemo: body.rawMemo,
        photos: {
          create: this.toPhotoCreateInputs(body.photos),
        },
      },
      include: {
        photos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    return {
      entry: this.toDiaryEntry(entry),
    };
  }

  async updateEntry(id: string, body: UpdateDiaryEntryInput): Promise<GetEntryResponse> {
    const existingEntry = await this.prisma.diaryEntry.findFirst({
      where: {
        id,
        ownerId: DEMO_OWNER_ID,
      },
      include: {
        photos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!existingEntry) {
      throw new NotFoundException(`Entry ${id} was not found`);
    }

    const updatedEntry = await this.prisma.$transaction(async (tx) => {
      if (body.photos) {
        await tx.photo.deleteMany({
          where: {
            entryId: id,
          },
        });
      }

      return tx.diaryEntry.update({
        where: {
          id,
        },
        data: {
          gameId: body.gameId,
          seasonYear: body.seasonYear,
          date: body.date,
          favoriteTeam: body.favoriteTeam,
          opponentTeam: body.opponentTeam,
          scoreFor: body.scoreFor,
          scoreAgainst: body.scoreAgainst,
          result: body.result,
          watchType: body.watchType,
          stadium: body.stadium,
          seat: body.seat,
          playerOfTheDay: body.playerOfTheDay,
          highlight: body.highlight,
          rawMemo: body.rawMemo,
          ...(body.photos
            ? {
                photos: {
                  create: this.toPhotoCreateInputs(body.photos),
                },
              }
            : {}),
        },
        include: {
          photos: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });
    });

    return {
      entry: this.toDiaryEntry(updatedEntry),
    };
  }

  async deleteEntry(id: string): Promise<DeleteEntryResponse> {
    const existingEntry = await this.prisma.diaryEntry.findFirst({
      where: {
        id,
        ownerId: DEMO_OWNER_ID,
      },
      include: {
        photos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!existingEntry) {
      throw new NotFoundException(`Entry ${id} was not found`);
    }

    await this.prisma.diaryEntry.delete({
      where: {
        id,
      },
    });

    return {
      entry: this.toDiaryEntry(existingEntry),
    };
  }

  private toPhotoCreateInputs(photos: PhotoAsset[]) {
    return photos.map((photo, index) => ({
      id: photo.id || randomUUID(),
      url: photo.url,
      fileName: photo.fileName,
      sortOrder: index,
    }));
  }

  private toDiaryEntry(entry: DiaryEntryRecord): DiaryEntry {
    return {
      id: entry.id,
      ownerId: entry.ownerId,
      gameId: entry.gameId ?? undefined,
      seasonYear: entry.seasonYear,
      date: entry.date,
      favoriteTeam: entry.favoriteTeam,
      opponentTeam: entry.opponentTeam,
      scoreFor: entry.scoreFor ?? undefined,
      scoreAgainst: entry.scoreAgainst ?? undefined,
      result: entry.result,
      watchType: entry.watchType,
      stadium: entry.stadium ?? undefined,
      seat: entry.seat ?? undefined,
      playerOfTheDay: entry.playerOfTheDay ?? undefined,
      highlight: entry.highlight,
      rawMemo: entry.rawMemo ?? undefined,
      photos: entry.photos.map((photo) => this.toPhotoAsset(photo)),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }

  private toPhotoAsset(photo: Photo): PhotoAsset {
    return {
      id: photo.id,
      url: photo.url,
      fileName: photo.fileName ?? undefined,
    };
  }

  private buildSummary(entries: DiaryEntry[]): DiaryEntrySummary {
    return entries.reduce<DiaryEntrySummary>(
      (summary, entry) => {
        summary.totalGames += 1;

        if (entry.result === 'WIN') {
          summary.wins += 1;
        }

        if (entry.result === 'LOSE') {
          summary.losses += 1;
        }

        if (entry.result === 'DRAW') {
          summary.draws += 1;
        }

        return summary;
      },
      {
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
    );
  }
}
