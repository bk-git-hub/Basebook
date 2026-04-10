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
import type {
  CreateDiaryEntryInput,
  GameResult,
  TeamCode,
  WatchType,
} from '@basebook/contracts';
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

export class CreateEntryDto implements CreateDiaryEntryInput {
  @IsOptional()
  @IsString()
  gameId?: string;

  @IsInt()
  @Min(1900)
  seasonYear!: number;

  @IsDateString()
  date!: string;

  @IsIn(TEAM_CODES)
  favoriteTeam!: TeamCode;

  @IsIn(TEAM_CODES)
  opponentTeam!: TeamCode;

  @IsOptional()
  @IsInt()
  scoreFor?: number;

  @IsOptional()
  @IsInt()
  scoreAgainst?: number;

  @IsIn(GAME_RESULTS)
  result!: GameResult;

  @IsIn(WATCH_TYPES)
  watchType!: WatchType;

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

  @IsString()
  @MaxLength(300)
  highlight!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  rawMemo?: string;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PhotoAssetDto)
  photos!: PhotoAssetDto[];
}
