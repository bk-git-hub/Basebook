import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { GameResult, TeamCode, UpdateDiaryEntryInput, WatchType } from '@basebook/contracts';
import { PhotoAssetDto } from './photo-asset.dto';

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

const GAME_RESULTS: GameResult[] = ['WIN', 'LOSE', 'DRAW', 'UNKNOWN'];
const WATCH_TYPES: WatchType[] = ['STADIUM', 'TV', 'MOBILE', 'OTHER'];

export class UpdateEntryDto implements UpdateDiaryEntryInput {
  @IsOptional()
  @IsString()
  gameId?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  seasonYear?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn(TEAM_CODES)
  favoriteTeam?: TeamCode;

  @IsOptional()
  @IsIn(TEAM_CODES)
  opponentTeam?: TeamCode;

  @IsOptional()
  @IsInt()
  scoreFor?: number;

  @IsOptional()
  @IsInt()
  scoreAgainst?: number;

  @IsOptional()
  @IsIn(GAME_RESULTS)
  result?: GameResult;

  @IsOptional()
  @IsIn(WATCH_TYPES)
  watchType?: WatchType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  stadium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  seat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  playerOfTheDay?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  highlight?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  rawMemo?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PhotoAssetDto)
  photos?: PhotoAssetDto[];
}
