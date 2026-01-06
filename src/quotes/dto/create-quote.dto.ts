import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuoteDto {
  @IsInt()
  @Type(() => Number)
  orderId: number;

  @IsNumber()
  @Type(() => Number)
  total: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  approvedBy?: number;

  @IsOptional()
  @IsObject()
  quoteDetails?: {
    items?: Array<{
      length: number;
      width: number;
      pricePerMeter: number;
      total: number;
    }>;
    transportFee?: number;
    discount?: number;
  };
}

