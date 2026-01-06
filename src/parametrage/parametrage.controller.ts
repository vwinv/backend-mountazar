import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ParametrageService } from './parametrage.service';
import { UpdateParametrageDto } from './dto/update-parametrage.dto';

@Controller('api/parametrage')
export class ParametrageController {
  constructor(private readonly parametrageService: ParametrageService) {}

  /**
   * Données publiques pour le hero du site vitrine / boutique.
   * Accessible sans authentification.
   */
  @Get('public/hero')
  async getPublicHero() {
    const current = await this.parametrageService.getCurrent();

    return {
      siteTitle: current.siteTitle,
      siteSubtitle: current.siteSubtitle,
      heroTitle: current.heroTitle,
      heroSubtitle: current.heroSubtitle,
      heroBackgrounds: (current.heroBackgrounds as unknown as string[]) ?? [],
    };
  }

  /**
   * Données publiques pour le footer du site vitrine / boutique.
   * Accessible sans authentification.
   */
  @Get('public/footer')
  async getPublicFooter() {
    const current = await this.parametrageService.getCurrent();

    return {
      siteTitle: current.siteTitle,
      contactEmail: current.contactEmail,
      contactPhone: current.contactPhone,
      facebookUrl: current.facebookUrl,
      instagramUrl: current.instagramUrl,
      twitterUrl: current.twitterUrl,
      tiktokUrl: current.tiktokUrl,
    };
  }

  /**
   * Données publiques pour la page "À propos" du site vitrine / boutique.
   * Accessible sans authentification.
   */
  @Get('public/about')
  async getPublicAbout() {
    const current = await this.parametrageService.getCurrent();

    return {
      aboutTitle: current.aboutTitle,
      aboutContent: current.aboutContent,
      valuesTitle: current.valuesTitle,
      values: (current.values as unknown as { title: string; content: string }[]) ?? [],
      galleryImages: (current.galleryImages as unknown as string[]) ?? [],
    };
  }

  /**
   * Récupération complète du paramétrage (admin uniquement).
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCurrent() {
    return this.parametrageService.getCurrent();
  }

  /**
   * Mise à jour du paramétrage (admin uniquement).
   */
  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Body() body: any) {
    // On accepte heroBackgrounds, galleryImages et values comme tableaux
    const dto: UpdateParametrageDto & {
      heroBackgrounds?: string[];
      galleryImages?: string[];
      values?: { title: string; content: string }[];
    } = {
      ...body,
      heroBackgrounds: body.heroBackgrounds,
      galleryImages: body.galleryImages,
      values: body.values,
    };

    return this.parametrageService.update(dto);
  }
}


