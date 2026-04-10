import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  GameCandidate,
  GetGamesQuery,
  GetGamesResponse,
} from '@basebook/contracts';

@Injectable()
export class GamesService {
  getGames(query: GetGamesQuery): GetGamesResponse {
    const games = this.readGames();

    return {
      games: games.filter((game) => {
        if (game.favoriteTeam !== query.favoriteTeam) {
          return false;
        }

        if (query.date && game.date !== query.date) {
          return false;
        }

        if (query.seasonYear && game.seasonYear !== query.seasonYear) {
          return false;
        }

        return true;
      }),
    };
  }

  private readGames(): GameCandidate[] {
    const filePath = resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'data',
      'demo-games.json',
    );
    const rawJson = readFileSync(filePath, 'utf-8');
    return JSON.parse(rawJson) as GameCandidate[];
  }
}
