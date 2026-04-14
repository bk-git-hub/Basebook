import { IsString, MaxLength, MinLength } from 'class-validator';

export class CancelSeasonBookOrderDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  cancelReason!: string;
}
