import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertShopReviewDto {
  @IsInt()
  @Min(1, { message: 'La note doit être au moins 1' })
  @Max(5, { message: 'La note ne peut pas dépasser 5' })
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string | null;
}
