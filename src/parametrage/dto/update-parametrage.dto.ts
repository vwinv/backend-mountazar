import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateParametrageDto {
  @IsOptional()
  @IsString()
  siteTitle?: string;

  @IsOptional()
  @IsString()
  siteSubtitle?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  heroTitle?: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  // heroBackgrounds et galleryImages seront gérés comme tableaux côté controller

  @IsOptional()
  @IsString()
  aboutTitle?: string;

  @IsOptional()
  @IsString()
  aboutContent?: string;

  @IsOptional()
  @IsString()
  valuesTitle?: string;

  @IsOptional()
  @IsString()
  valuesContent?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


