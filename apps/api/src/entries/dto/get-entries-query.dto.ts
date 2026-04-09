import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import type { GetEntriesQuery, TeamCode } from '@basebook/contracts';

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

export class GetEntriesQueryDto implements GetEntriesQuery {
  @IsOptional()
  @IsIn(TEAM_CODES)
  favoriteTeam?: TeamCode;

  @IsOptional()
  @IsInt()
  @Min(1900)
  seasonYear?: number;
}
