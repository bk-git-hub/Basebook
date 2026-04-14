import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { SeasonBookOrderRequest } from '@basebook/contracts';

export class OrderSeasonBookDto implements SeasonBookOrderRequest {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  recipientName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  recipientPhone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address2?: string;
}
