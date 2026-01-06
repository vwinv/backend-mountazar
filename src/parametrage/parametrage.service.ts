import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateParametrageDto } from './dto/update-parametrage.dto';

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

    return this.prisma.parametrage.update({
      where: { id: current.id },
      data: {
        ...data,
        // Convertir les tableaux en JSON
        heroBackgrounds: data.heroBackgrounds ?? (current.heroBackgrounds as any),
        galleryImages: data.galleryImages ?? (current.galleryImages as any),
        values: data.values ?? (current.values as any),
      },
    });
  }
}


