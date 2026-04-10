import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import type { GetGamesResponse, TeamCode } from '@basebook/contracts';
import { GamesService } from './games.service';

const TEAM_CODES: TeamCode[] = [
  'LG',
  'DOOSAN',
  'SSG',
  'KIWOOM',
  'KT',
  'NC',
  'KIA',
  'LOTTE',
  'SAMSUNG',
  'HANWHA',
];

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  getGames(
    @Query('favoriteTeam') favoriteTeam?: string,
    @Query('date') date?: string,
    @Query('seasonYear') seasonYear?: string,
  ): GetGamesResponse {
    if (!favoriteTeam) {
      throw new BadRequestException('favoriteTeam is required');
    }

    if (!TEAM_CODES.includes(favoriteTeam as TeamCode)) {
      throw new BadRequestException('favoriteTeam must be a valid team code');
    }

    const parsedSeasonYear = this.parseSeasonYear(seasonYear);

    return this.gamesService.getGames({
      favoriteTeam: favoriteTeam as TeamCode,
      date,
      seasonYear: parsedSeasonYear,
    });
  }

  private parseSeasonYear(seasonYear?: string) {
    if (!seasonYear) {
      return undefined;
    }

    const parsedSeasonYear = Number.parseInt(seasonYear, 10);
    if (Number.isNaN(parsedSeasonYear)) {
      throw new BadRequestException('seasonYear must be a number');
    }

    return parsedSeasonYear;
  }
}
