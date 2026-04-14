import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { UpdateSeasonBookShippingRequest } from '@basebook/contracts';

export class UpdateSeasonBookShippingDto implements UpdateSeasonBookShippingRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  shippingMemo?: string;
}
