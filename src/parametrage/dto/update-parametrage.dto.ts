import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => (value == null ? undefined : String(value)))
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : String(value)))
  @IsString()
  contactPhoneMobile?: string;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : String(value)))
  @IsString()
  contactPhoneFax?: string;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : String(value)))
  @IsString()
  contactWhatsapp?: string;

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

  // URL TikTok
  @IsOptional()
  @IsString()
  tiktokUrl?: string;

  // Champs tableau gérés principalement côté controller / service
  @IsOptional()
  heroBackgrounds?: string[];

  @IsOptional()
  galleryImages?: string[];

  @IsOptional()
  values?: { title: string; content: string }[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


