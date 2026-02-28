import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateParametrageDto } from './dto/update-parametrage.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ParametrageService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent() {
    const existing = await this.prisma.parametrage.findFirst({
      orderBy: { id: 'asc' },
    });

    if (!existing) {
      // Créer une entrée par défaut si rien n'existe encore
      return this.prisma.parametrage.create({
        data: {
          siteTitle: 'Mountazar',
          isActive: true,
        },
      });
    }

    return existing;
  }

  async update(
    data: UpdateParametrageDto & {
      heroBackgrounds?: string[];
      galleryImages?: string[];
      values?: { title: string; content: string }[];
    },
  ) {
    const current = await this.getCurrent();
    const id = current.id;

    // Champs scalaires de coordonnées : utiliser SQL brut pour éviter erreur client Prisma
    const contactFields: Array<{ col: string; val: unknown }> = [];
    const d = data as Record<string, unknown>;
    const contactKeys = [
      'contactEmail', 'contactPhone', 'contactPhoneMobile', 'contactPhoneFax', 'contactWhatsapp',
      'address', 'facebookUrl', 'instagramUrl', 'twitterUrl', 'tiktokUrl',
    ] as const;
    for (const key of contactKeys) {
      const v = d[key];
      if (v !== undefined && v !== null) {
        contactFields.push({ col: `"${key}"`, val: String(v) });
      }
    }

    if (contactFields.length > 0) {
      const sets = contactFields.map((f, i) => `${f.col} = $${i + 1}`).join(', ');
      const params = [...contactFields.map(f => f.val), id];
      await this.prisma.$executeRawUnsafe(
        `UPDATE "Parametrage" SET ${sets}, "updatedAt" = NOW() WHERE id = $${params.length}`,
        ...params,
      );
    }

    // Autres champs : utiliser l'API Prisma standard
    const updateData: Record<string, unknown> = {};
    if (data.heroBackgrounds !== undefined) updateData.heroBackgrounds = data.heroBackgrounds;
    if (data.galleryImages !== undefined) updateData.galleryImages = data.galleryImages;
    if (data.values !== undefined) updateData.values = data.values;

    const otherKeys = [
      'siteTitle', 'siteSubtitle', 'logoUrl', 'heroTitle', 'heroSubtitle',
      'aboutTitle', 'aboutContent', 'valuesTitle', 'valuesContent',
      'isActive',
    ] as const;
    for (const key of otherKeys) {
      const v = (data as Record<string, unknown>)[key];
      if (v !== undefined && v !== null) updateData[key] = v;
    }

    if (Object.keys(updateData).length > 0) {
      return this.prisma.parametrage.update({
        where: { id },
        data: updateData as Prisma.ParametrageUpdateInput,
      });
    }

    return this.getCurrent();
  }
}


