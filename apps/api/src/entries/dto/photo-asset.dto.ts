import { IsOptional, IsString, IsUrl } from 'class-validator';

export class PhotoAssetDto {
  @IsString()
  id!: string;

  @IsUrl({
    require_tld: false,
  })
  url!: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}
