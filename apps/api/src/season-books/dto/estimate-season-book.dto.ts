import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import type { SeasonBookEstimateRequest } from '@basebook/contracts';

export class EstimateSeasonBookDto implements SeasonBookEstimateRequest {
  @IsInt()
  @Min(1900)
  seasonYear!: number;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  introText?: string;

  @IsUrl({
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  coverPhotoUrl!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  selectedEntryIds!: string[];
}
